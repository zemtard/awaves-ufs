//TODO DOCKERIZE THIS APP
//TODO TEST APP try breaking
//TODO GRAPHQL FOR AUTOMATIC ENDPOINTS
//TODO SOME FILTERED DATA READINGS
//TODO CYPRESS TESTING

const WebSocket = require('ws');
const express = require('express')
const app = express()
const port = 1337
const server = require('http').createServer(app)
const wss = new WebSocket.Server({server});
const mongoose = require('mongoose')

const submit_custom = require('./custom_data/index.js')
const {submit_userdata2} = require('./user_data/index.js')

const {v4: uuid } = require('uuid'); //FOR GENERATING UNIQUE SESSION IDS

var clients = new Map();

const uri = "mongodb+srv://zemtard:zzz1998@test.aohdt.mongodb.net/feedback?retryWrites=true&w=majority";

//CONNECTING DATABASE AND STARTING SERVER IF DATABASE CONNECTION IS SUCCESSful
mongoose.connect(uri).then((result) => {
  console.log("DB CONNECTED")
  server.listen(port, () => {
    console.log(`APP LISTENING ON PORT: ${port}`)
  })
}).catch((err) => {
  console.log("ERROR CONNECTING")
  console.log(err)
})


//WEBSOCKET HANDLING
wss.on("connection", (ws, req) => {

  session_id = uuid();
  session_start = new Date(); //getting users start time

  ip = req.socket.remoteAddress;

  //client details step 1
  metadata = {session_id, 
    ip, 
    session_start, 
    session_end : null,
    session_length : null,
    device : null,
    OS : null,
    browser : null,
    version : null
  };

  clients.set(ws, metadata);
  
  //console.log(clients.values());

  console.log("new client connected 😎 " + ip); // user connects, display his ip

  console.log('Clients connected: '+ clients.size);
  
  // sending message
  ws.on("message", data => {
    
      prettyData = JSON.parse(data)
      //console.log(prettyData)

      switch(prettyData.collection){

        case 1 : 

        console.log("user 💀 added feedback for collection 1: SESSION_ID: " + clients.get(ws).session_id);
        submit_custom(prettyData);
        break;

        case 2 : 

        console.log("user 💀 added feedback for collection 2: SESSION_ID: " + clients.get(ws).session_id);
        //building client details step 2
        clients.get(ws).device = prettyData.device
        clients.get(ws).OS = prettyData.OS
        clients.get(ws).browser = prettyData.browser
        clients.get(ws).version = prettyData.version

        break;

      }

  });
  // handling what to do when clients disconnects from server
  ws.on("close",  () => {
      //NOT THE END IF PHONE GOES TO SLEEP OR WS JUST DISCONNECTS
      
      clients.get(ws).session_end = new Date(); //sets specific clients sessions end time
      session_length2 = new Date(clients.get(ws).session_end - clients.get(ws).session_start) //getting session length with in mind of session id
      //clients details step 3
      clients.get(ws).session_length = session_length2.getSeconds();

      console.log("the client has disconnected 🤮 " + clients.get(ws).ip + " SESSION_ID: " + clients.get(ws).session_id);

      submit_userdata2(clients.get(ws)); // submits user detail data on clients exit

      clients.delete(ws) //removes closed session from map
      console.log('Clients connected: '+ clients.size);

  });
  // handling client connection error
  ws.onerror = function () {
      console.err("ERROR")
  }
});

app.get('/active-sessions', async (req, res) => {
  res.send('sessions');
  console.log("ACTIVE SESSIONS REQUESTED ");
})

app.get('/custom', async (req, res) => { //Returns all custom labelled data
  custom.find().then((result) => res.send(result)).catch((err) => console.log(err))
  console.log("ALL CUSTOM DATA REQUESTED");
})

app.get('/userdata', async (req, res) => { //Returns all user data
  user_data.find().then((result) => res.send(result)).catch((err) => console.log(err))
  console.log("ALL USER DATA REQUESTED");
})

app.get('/status', async (req, res) => {
  res.send('IS ON')
})
