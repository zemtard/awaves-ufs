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
  session_start = new Date(); //getting users start time
  console.log("new client connected 😎 : " + req.socket.remoteAddress + " | " + session_start); // user connects, display his ip
  // sending message
  ws.on("message", data => { //create endpoints here?
      //console.log(`Client has sent us: ${data}`)
      prettyData = JSON.parse(data)
      console.log(prettyData)

      switch(prettyData.type){
        case "song-rating" : //Feedback type song-rating
        console.log("stupid user 💀 added feedback");
          const feedback = new Feedback({
          song: 'song NAME',
          rating: prettyData.rating
        })
        feedback.save()
        break;
      }
// if massage contains yo save feedback
      // if(data.includes("yo")){

      //   console.log("stupid user 💀 added feedback")

      //   const feedback = new Feedback({
      //     song: 'song2',
      //     rating: "like"
      //   })
      //   feedback.save()
      // }

  });
  // handling what to do when clients disconnects from server
  ws.on("close", () => {
      session_end = new Date(); //getting users end time
      diff = new Date(session_end - session_start) //getting session length
      console.log("the client has disconnected 🤮 " + req.socket.remoteAddress + " | " + session_end);
      console.log(diff/60000 + " min")
      console.log(diff/1000 + " sec")
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
