const WebSocket = require('ws');
const express = require('express')
const app = express()
const port = 3000
const server = require('http').createServer(app)
const wss = new WebSocket.Server({server});

const mongoose = require('mongoose')
const Feedback = require('./models/feedback.js')

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
  console.log("new client connected 😎 : " + req.socket.remoteAddress); // user connects, display his ip
  // sending message
  ws.on("message", data => { //create endpoints here?
      console.log(`Client has sent us: ${data}`)
      if(data.includes("yo")){
        console.log("stupid user 💀")
      }
  });
  // handling what to do when clients disconnects from server
  ws.on("close", () => {
      console.log("the client has disconnected 🤮");
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

  feedback.save().then((result) => res.send(result)).catch((err) => console.log(err));
})

//RETURNS ALL FEEDBACK ENTRIES

app.get('/get-all-review', async (req, res) => {
  Feedback.find().then((result) => res.send(result)).catch((err) => console.log(err))

})

//TODO CREATE CREATE ENDPOINTS
//TODO CREATE UPDATE ENDPOINTS
//TODO CREATE DELETE ENDPOINTS
