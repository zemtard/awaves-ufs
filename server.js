//TODO DOCKERIZE THIS APP                      0
//TODO TEST APP try breaking                   70-80
//TODO GRAPHQL FOR AUTOMATIC ENDPOINTS         0
//TODO SOME FILTERED DATA READINGS             50
//TODO CYPRESS TESTING                         0

require("dotenv").config();

const WebSocket = require("ws");
const express = require("express");
const app = express();
const port = process.env.PORT;
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
const mongoose = require("mongoose");

const submit_custom = require("./custom_data/index.js");
const { submit_userdata2 } = require("./user_data/index.js");

const custom = require("./custom_data/custom.js");
const user_data = require("./user_data/userdata.js");

const { v4: uuid } = require("uuid"); //FOR GENERATING UNIQUE SESSION IDS
const parser = require("ua-parser-js");

var clients = new Map();

const uri = process.env.DATABASE_URI;

//CONNECTING DATABASE AND STARTING SERVER IF DATABASE CONNECTION IS SUCCESSful
mongoose
  .connect(uri)
  .then((result) => {
    console.log("DB CONNECTED");
    server.listen(port, () => {
      console.log(`APP LISTENING ON PORT: ${port}`);
    });
  })
  .catch((err) => {
    console.log("ERROR CONNECTING");
    console.log(err);
  });

//WEBSOCKET SERVER
wss.on("connection", (ws, req) => {
  //WEBSOCKET CLIENT ON CONNECT

  url = require("url").parse(req.url);
  const urlParams = new URLSearchParams(url.query);

  session_id_temp = urlParams.get("id");

  console.log(urlParams.get("id"));

  returnFlag = false;

  if (session_id_temp != null) {
    returnFlag = true;
  }

  console.log("Return flag: " + returnFlag);

  if (returnFlag == true) {
    //if its a reconnect case check if theres a matching session id
    console.log("Client reconnecting session ID: " + session_id_temp);
    reconnecting_client_old = getByValue(clients, session_id_temp);
    if (reconnecting_client_old != undefined || reconnecting_client_old != null) {
      clients.set(ws, clients.get(reconnecting_client_old));
      clients.delete(reconnecting_client_old);
      clients.get(ws).disconnect_flag = false;
      console.log("client sucesfully reconnected :)");
    } else {
      //if cannot find a session, reset flag and add user to new session
      returnFlag = false;
      console.log("Client tried reconnecting but session ID: " + session_id_temp + " has expired");
    }
  }

  if (returnFlag == false) {
    //check if its a fresh connect

    user_agent = parser(req.headers["user-agent"]);
    //console.log(user_agent);
    session_id = uuid();
    session_start = new Date(); //getting users start time
    ws.send(session_id);

    ip = req.socket.remoteAddress;

    //client details step 1
    metadata = {
      session_id,
      ip,
      session_start,
      session_end: null,
      session_length: null,
      device_type: user_agent.device.type,
      device_model: user_agent.device.model,
      OS: user_agent.os.name,
      OS_version: user_agent.os.version,
      browser: user_agent.browser.name + " " + user_agent.browser.version,
      version: null,
      last_disconnect_time: null,
      disconnect_flag: false,
    };

    clients.set(ws, metadata);

    //console.log(clients.values());

    console.log("new client connected 😎 " + ip + " ID: " + clients.get(ws).session_id); // user connects, display his ip

    console.log("Clients connected: " + clients.size);
  }

  // sending message
  ws.on("message", (data) => {
    //WEBSOCKET CLIENT ON MESSAGE

    prettyData = JSON.parse(data);

    switch (prettyData.collection) {
      case 1:
        console.log("user 💀 added feedback for collection 1: SESSION_ID: " + clients.get(ws).session_id);
        submit_custom(prettyData);
        break;

      case 2:
        console.log("user 💀 added feedback for collection 2: SESSION_ID: " + clients.get(ws).session_id);
        //building client details step 2
        clients.get(ws).version = prettyData.version;
        break;
    }
  });
  // handling what to do when clients disconnects from server
  ws.on("close", () => {
    //WS CLIENT ON CLOSE
    clients.get(ws).last_disconnect_time = new Date(); //sets specific clients sessions end time

    console.log("the client has disconnected 🤮 " + clients.get(ws).ip + " SESSION_ID: " + clients.get(ws).session_id);

    clients.get(ws).disconnect_flag = true;

    console.log("Clients connected: " + clients.size);
  });
  // handling client connection error
  ws.onerror = function () {
    console.err("ERROR");
  };
});

//ENDPOINTS

app.get("/active-sessions", async (req, res) => {
  //res.send(clients.values());
  console.log("ACTIVE SESSIONS REQUESTED ");
});

app.get("/custom", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log("ALL CUSTOM DATA REQUESTED");
});

app.get("/userdata/version=:ver", async (req, res) => {
  //Returns all custom labelled data
  user_data
    .find({ version: req.params.ver })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(req.params.ver + " USER DATA REQUESTED");
});

app.get("/custom/version=:ver", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find({ version: req.params.ver })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(req.params.ver + " CUSTOM DATA REQUESTED");
});

app.get("/custom/label=:var", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find({ label: req.params.var })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(req.params.var + " CUSTOM DATA REQUESTED");
});

app.get("/userdata", async (req, res) => {
  //Returns all user data
  user_data
    .find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log("ALL USER DATA REQUESTED");
});

app.get("/status", async (req, res) => {
  res.send("IS ON");
});

function getDifferenceInSeconds(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / 1000;
}

setInterval(function () {
  //Watching for
  clients.forEach((value, key) => {
    //console.log(value, key);
    if (value.disconnect_flag == true) {
      length_temp = getDifferenceInSeconds(value.last_disconnect_time, new Date());
      console.log("disconnected client found ID: " + value.session_id + " | DISCONNECTED for: " + length_temp + "sec");

      if (length_temp > +process.env.CLIENT_TIMEOUT_SECONDS) {
        //last check to ensure client has really disconnected
        clients.get(key).session_end = value.last_disconnect_time;
        clients.get(key).session_length = getDifferenceInSeconds(value.session_end, value.session_start); //session length in seconds
        submit_userdata2(value);
        clients.delete(key);
        console.log("deleting inactive client " + value.session_id);
      }
    }
  });
}, 1000);

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value.session_id === searchValue) return key;
  }
}
