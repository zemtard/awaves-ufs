const WebSocket = require('ws');
const express = require('express')
const app = express()
const port = 3000
const server = require('http').createServer(app)
const wss = new WebSocket.Server({server});
const mongoose = require('mongoose')

const user_data = require('./models/userdata.js')
const custom = require('./models/custom.js')

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
  ws.on("message", data => { //create endpoints here?
      prettyData = JSON.parse(data)
      console.log(prettyData)

      switch(prettyData.collection){
        case 1 : 
        console.log("stupid user 💀 added feedback for collection 1: ");

        const custom_data = new custom({
          label: prettyData.label,
          payload: prettyData.payload,
          version: prettyData.version
        })

        custom_data.save()

        break;
        case 2 : 
        console.log("stupid user 💀 added feedback for collection 2: ");

        involentary.device = prettyData.device;
        involentary.browser = prettyData.browser;
        involentary.OS = prettyData.OS;
        involentary.version = prettyData.version;
        break;
      }


  });
  // handling what to do when clients disconnects from server
  ws.on("close", () => {
      session_end = new Date(); //getting users end time
      diff = new Date(session_end - session_start) //getting session length
      console.log("the client has disconnected 🤮 " + req.socket.remoteAddress + " | " + session_end);
      console.log("===SESSION INFO===")
      console.log(diff/60000 + " min")
      console.log(diff/1000 + " sec")
      console.log("===SESSION INFO end===")

      involentary.session_length = diff;
      involentary.location = req.socket.remoteAddress;
      involentary.save();

  });
  // handling client connection error
  ws.onerror = function () {
      console.log("Some Error occurred")
  }
});

// HTTP ENDPOINTS
app.get('/', (req, res) => {
  res.send('i will kill you')
  console.log("kill trigerred");
})

app.get('/hello', async (req, res) => {
  res.send('Hello World')
})

app.get('/status', (req, res) => {
  res.send('IS ON')
})

//ADDS REVIEW WITH A GET REQUEST

app.get('/add-review', async (req, res) => {
  const feedback = new Feedback({
    song: 'song2',
    rating: "like"
  })

  //feedback.save().then((result) => res.send(result)).catch((err) => console.log(err)); //storing
})

//RETURNS ALL FEEDBACK ENTRIES

app.get('/get-all-review', async (req, res) => {
  //Feedback.find().then((result) => res.send(result)).catch((err) => console.log(err)) //returning

})

//TODO CREATE CREATE ENDPOINTS
//TODO CREATE UPDATE ENDPOINTS
//TODO CREATE DELETE ENDPOINTS
