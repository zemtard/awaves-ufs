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
const {collect_passed ,submit_userdata} = require('./user_data/index.js')


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

  session_start = new Date(); //getting users start time
  console.log("new client connected 😎 " + req.socket.remoteAddress + " | " + session_start); // user connects, display his ip
  
  // sending message
  ws.on("message", data => {
    
      prettyData = JSON.parse(data)
      console.log(prettyData)

      switch(prettyData.collection){

        case 1 : 

        console.log("user 💀 added feedback for collection 1: ");
        submit_custom(prettyData);
        break;

        case 2 : 

        console.log("user 💀 added feedback for collection 2: ");
        collect_passed(prettyData, req.socket.remoteAddress);
        break;

      }

  });
  // handling what to do when clients disconnects from server
  ws.on("close",  () => {
      session_end = new Date(); //getting users end time
      //NOT THE END IF PHONE GOES TO SLEEP OR WS JUST DISCONNECTS
      session_length = new Date(session_end - session_start) //getting session length
      ip = req.socket.remoteAddress;
      console.log("the client has disconnected 🤮 " + req.socket.remoteAddress + " | " + session_end);
      console.log("===SESSION INFO===")
      console.log(session_length/60000 + " min")
      console.log(session_length/1000 + " sec")
      console.log("===SESSION INFO end===")

      submit_userdata(session_length);
      

  });
  // handling client connection error
  ws.onerror = function () {
      console.log("Some Error occurred")
  }
});

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
