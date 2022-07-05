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

const user_data = require('./user_data/userdata.js')
const custom = require('./custom_data/custom.js')


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

  user_data_flag = false;

  const involentary = new user_data({
    session_length: null,
    location: null,
    device: null,
    browser: null,
    OS: null,
    version: null
  })

  session_start = new Date(); //getting users start time
  console.log("new client connected 😎 " + req.socket.remoteAddress + " | " + session_start); // user connects, display his ip
  
  // sending message
  ws.on("message", data => {
    
      prettyData = JSON.parse(data)
      console.log(prettyData)

      switch(prettyData.collection){
        case 1 : 
        console.log("user 💀 added feedback for collection 1: ");

        const custom_data = new custom({
          label: prettyData.label,
          payload: prettyData.payload,
          version: prettyData.version
        })

        custom_data.save()

        break;
        case 2 : 
        console.log("user 💀 added feedback for collection 2: ");

        involentary.device = prettyData.device;
        involentary.browser = prettyData.browser;
        involentary.OS = prettyData.OS;
        involentary.version = prettyData.version;

        user_data_flag = true;

        break;
      }

  });
  // handling what to do when clients disconnects from server
  ws.on("close",  () => {
      session_end = new Date(); //getting users end time
      diff = new Date(session_end - session_start) //getting session length
      console.log("the client has disconnected 🤮 " + req.socket.remoteAddress + " | " + session_end);
      console.log("===SESSION INFO===")
      console.log(diff/60000 + " min")
      console.log(diff/1000 + " sec")
      console.log("===SESSION INFO end===")

      involentary.session_length = diff;
      involentary.location = req.socket.remoteAddress;

      if(user_data_flag == true){
        involentary.save();
      }
      

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
