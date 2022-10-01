//node_modules\.bin\cypress open to start CYPRESS

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

const { v4: uuid } = require("uuid"); //FOR GENERATING UNIQUE SESSION IDS
const parser = require("ua-parser-js");

const colors = require("colors");

var clients = new Map();

const endpoints = require("./routes/endpoints");

const uri = process.env.DATABASE_URI;

console.log(`==STRATING FEEDBACK SYSTEM==`.brightBlue);

//CONNECTING DATABASE AND STARTING SERVER IF DATABASE CONNECTION IS SUCCESSful

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

//WEBSOCKET SERVER
wss.on("connection", (ws, req) => {
  //WEBSOCKET CLIENT ON CONNECT

  let url = require("url").parse(req.url); //getting connect request url
  let urlParams = new URLSearchParams(url.query);

  let session_id_temp = urlParams.get("id");

  let returnFlag = false;

  if (session_id_temp !== null) {
    returnFlag = true;
  }

  if (returnFlag) {
    //if its a reconnect case check if theres a matching session id
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

  if (!returnFlag) {
    //check if its a fresh connect

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
    ); // user connects, display his ip
  }

  // sending message
  ws.on("message", (data) => {
    //WEBSOCKET CLIENT ON MESSAGE
    let prettyData = null;
    try {
      console.log(`[DATA] [ALL_INCOMING] data=${data}`); // printing all incoming messages
      prettyData = JSON.parse(data);
    } catch (error) {
      prettyData = null;
    }

    if (prettyData !== null) {
      switch (prettyData.collection) {
        case 1: //CUSTOM LABELLED DATA CASE
          console.log(`[DATA] [SUBMIT_CUSTOM_DATA] SESSION_ID=${clients.get(ws).session_id}`);
          submit_custom(prettyData, clients.get(ws).session_id);
          break;

        case 2: //USER DATA CASE
          console.log(`[DATA] [USER_DATA] SESSION_ID=${clients.get(ws).session_id}`);
          //building client details step 2
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
  // handling what to do when client disconnects from server
  ws.on("close", () => {
    //WS CLIENT ON CLOSE
    clients.get(ws).last_disconnect_time = new Date(); //sets specific clients sessions end time

    console.log(`[EVENT] [CLIENT_CLOSE] SESSION_ID=${clients.get(ws).session_id}, ip=${clients.get(ws).ip}`);

    clients.get(ws).disconnect_flag = true;

    if (clients.get(ws).self_close) {
      submit_userdata2(clients.get(ws));
      clients.delete(ws);
    }
  });
  // handling client connection error
  ws.onerror = function () {
    console.err(`ERROR`);
  };
});

//ENDPOINTS
app.use("", endpoints);

// app.get("/custom", async (req, res) => {
//   //Returns all custom labelled data
//   custom
//     .find()
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
//   console.log(`[ENDPOINT] GET ALL CUSTOM DATA`);
// });

// app.get("/userdata/version=:ver", async (req, res) => {
//   //Returns all custom labelled data
//   user_data
//     .find({ version: req.params.ver })
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
//   console.log(`[ENDPOINT] USER DATA WITH VERSION: ${req.params.ver} REQUESTED`);
// });

// app.get("/custom/version=:ver", async (req, res) => {
//   //Returns all custom labelled data
//   custom
//     .find({ version: req.params.ver })
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
//   console.log(`[ENDPOINT] CUSTOM DATA WITH VERSION: ${req.params.ver} REQUESTED`);
// });

// app.get("/custom/label=:var", async (req, res) => {
//   //Returns all custom labelled data
//   custom
//     .find({ label: req.params.var })
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
//   console.log(`[ENDPOINT] CUSTOM DATA WITH LABEL: ${req.params.var} REQUESTED`);
// });

// app.get("/userdata", async (req, res) => {
//   //Returns all user data
//   user_data
//     .find()
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
//   console.log("[ENDPOINT] GET ALL USER DATA");
// });

// app.get("/status", async (req, res) => {
//   res.send("im online");
//   console.log("[ENDPOINT] GET STATUS");
// });

function getDifferenceInSeconds(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / 1000;
}

function sessionWatcher() {
  //CLIENT MANAGER
  //Watching for how long client has been disconnected
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
