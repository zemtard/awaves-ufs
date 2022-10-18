require("dotenv").config();

const WebSocket = require("ws");
const express = require("express");
const app = express();
const port = process.env.PORT;
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const mongoose = require("mongoose");

const custom = require("./models/custom_data/custom.js");
const user_data = require("./models/user_data/userdata.js");

const submit_custom = require("./models/custom_data/index.js");
const { submit_userdata2 } = require("./models/user_data/index.js");

const { v4: uuid } = require("uuid"); //Generates unique ids
const parser = require("ua-parser-js");

const colors = require("colors");

var clients = new Map();

const endpoints = require("./routes/endpoints");

const uri = process.env.DATABASE_URI;

console.log(`==STRATING FEEDBACK SYSTEM==`.brightBlue);

/*
============================================================================
User Feedback System Initialization

The system connects to the MongoDB database using .env variable for URI
The system opens a http server on port from .env variable for port
============================================================================
*/

mongoose
  .connect(uri)
  .then((result) => {
    console.log(`DB CONNECTED`.green);
    server.listen(port, () => {
      console.log(`APP LISTENING ON PORT: ${port}`.green);
    });
  })
  .catch((err) => {
    console.log(`ERROR CONNECTING`.red);
    console.log(err);
  });

/*
============================================================================
WebSocket server
Manages WebSocket clients on their connection, messages and connection termination

Websocket server on connection:
- Accepts client connections
- Creates client object associated to 'ws' object and maps it to unique client metadata
- Handling client reconnecting and returning to original session
- Gets and stores connected users device information
============================================================================
*/

wss.on("connection", (ws, req) => {
  //Getting URL the client connected with as it may contain his old session-id in cases of reconnect
  let url = require("url").parse(req.url);
  let urlParams = new URLSearchParams(url.query);

  let session_id_temp = urlParams.get("id");

  let returnFlag = false;

  if (session_id_temp !== null) {
    returnFlag = true;
  }

  //Reconnect case, ensuring the clients map has a matching session id with the client trying to reconnect
  if (returnFlag) {
    console.log(`[EVENT] [RECONNECT_ATTEMPT] SESSION_ID=${session_id_temp} `);
    let reconnecting_client_old = getByValue(clients, session_id_temp);
    if (reconnecting_client_old != undefined || reconnecting_client_old != null) {
      clients.set(ws, clients.get(reconnecting_client_old));
      clients.delete(reconnecting_client_old);
      clients.get(ws).disconnect_flag = false;
      console.log(`[EVENT] [RECONNECT_ATTEMPT_SUCCESS] SESSION_ID=${session_id_temp}`);
    } else {
      //if cannot find a session, reset flag and add user to new session
      returnFlag = false;
      console.log(`[EVENT] [RECONNECT_ATTEMPT_FAILED] SESSION_ID=${session_id_temp}`);
    }
  }

  //Fresh connect case, generates session id, clients metadata and sends session id to client for reconnect purposes
  //Fresh client is added to clients map
  if (!returnFlag) {
    let user_agent = parser(req.headers["user-agent"]);
    let session_id = uuid();
    let session_start = new Date(); //getting users start time
    ws.send(session_id);

    let ip = req.socket.remoteAddress;

    //client details step 1
    let metadata = {
      session_id,
      ip,
      session_start,
      session_end: null,
      session_length: null,
      device_type: user_agent.device.type,
      device_model: user_agent.device.model,
      OS: user_agent.os.name,
      OS_version: user_agent.os.version,
      browser: `${user_agent.browser.name} ${user_agent.browser.version}`,
      version: null,
      last_disconnect_time: null,
      disconnect_flag: false,
      self_close: false,
    };

    clients.set(ws, metadata);

    console.log(
      `[EVENT] [NEW_CONNECTION] ip=${ip}, SESSION_ID=${clients.get(ws).session_id}, returnFlag=${returnFlag}`
    );
  }

  /*
============================================================================
Websocket server on message:
- Accepts messages from clients and ensures incoming data is in JSON format
- Incoming data is routed using a required field in the received data - collection
- collection = 1, saves custom labelled data to the database
- collection = 2, opts-in for user data collection
- collection = 'test', a route that can be called for testing purposes
============================================================================
*/

  ws.on("message", (data) => {
    let prettyData = null;
    try {
      console.log(`[DATA] [ALL_INCOMING] data=${data}`);
      prettyData = JSON.parse(data);
    } catch (error) {
      prettyData = null;
    }

    if (prettyData !== null) {
      switch (prettyData.collection) {
        case 1:
          console.log(`[DATA] [SUBMIT_CUSTOM_DATA] SESSION_ID=${clients.get(ws).session_id}`);
          submit_custom(prettyData, clients.get(ws).session_id);
          break;

        case 2:
          console.log(`[DATA] [USER_DATA] SESSION_ID=${clients.get(ws).session_id}`);
          //opts in for user data collection by receiving version
          clients.get(ws).version = prettyData.version;
          break;

        case 3: //100% APP CLOSED CASE
          clients.get(ws).self_close = true; //sets self close to true and the server wont wait for the user to timeout
          break;

        case "test":
          ws.send("TEST REPLY");
          break;
      }
    }
  });

  /*
============================================================================
Websocket server on connection termination:
- Saves last disconnect time for any client that disconnects
- Sets a disconnected flag for any disconnected clients
============================================================================
*/

  ws.on("close", () => {
    clients.get(ws).last_disconnect_time = new Date(); //sets specific clients sessions end time

    console.log(`[EVENT] [CLIENT_CLOSE] SESSION_ID=${clients.get(ws).session_id}, ip=${clients.get(ws).ip}`);

    clients.get(ws).disconnect_flag = true;

    if (clients.get(ws).self_close) {
      submit_userdata2(clients.get(ws));
      clients.delete(ws);
    }
  });
  ws.onerror = function () {
    console.err(`ERROR`);
  };
});

/*
============================================================================
Endpoints
- Allows to request data from the database on demand
- to see implementation go ./routes/endpoints.js
============================================================================
*/

app.use("", endpoints);

/*
============================================================================
Client session manager:
- Constantly checks state of active clients (every 1 second)
- Removes clients that have been disconnected for CLIENT_TIMOUT_SECONDS
- On client removal submits user data if opted in
============================================================================
*/

function sessionWatcher() {
  clients.forEach((value, key) => {
    if (value.disconnect_flag) {
      let length_temp = getDifferenceInSeconds(value.last_disconnect_time, new Date());
      if (length_temp > +process.env.CLIENT_TIMEOUT_SECONDS) {
        //last check to ensure client has really disconnected
        submit_userdata2(value);
        console.log(`[DATA] [SUBMIT_USER_DATA] SESSION_ID=${value.session_id}, data=${JSON.stringify(value)}`);
        clients.delete(key);
        console.log(`[EVENT] [REMOVE_INACTIVE_CLIENT] SESSION_ID=${value.session_id}`);
      }
    }
  });
}

setInterval(sessionWatcher, 1000);

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value.session_id === searchValue) return key;
  }
}

function getDifferenceInSeconds(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / 1000;
}
