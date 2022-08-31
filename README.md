# awaves-ufs

  

## Description

  

A system that collects and stores user feedback and user data from Awaves applications. Created for improving Awaves machine learning algorithms and collecting insights into Awaves user base.

  

### Created using

  

- Node.js

- Express.js

- Websocket

- mongodb

- Docker

  

### Functionality

  

- User session data and custom labelled user feedback collection and storage

- All data trackable by version, date and user session id

- Customizable launch variables: database URI, client timeout after, port

- Handling multiple users and apps simultaneously

- Endpoints for retrieving collected data

  

## Installation

  

1. Clone the project

`git clone https://github.com/zemtard/awaves-ufs.git`

2. Install NPM packages

`npm install`

3. Setup mongodb database uri, port and other variables in .env file

4. Run awaves - ufs

`npm run dev`

  

### Docker

  

1. Build docker image

`docker build -t "name" .`

2. Run docker image specifying a custom port (default port: 8080)

`docker run -p [PORT]:[PORT] -d "name"`

  

## Usage

  

### Integration

  

To integrate the system use awaves-usf front-end interface that directly communicates with this server, found in interface/socket.


`connect(ip)`
Starts websocket communication to the given IP address. This function also takes care of mobile users disconnecting due to device going to sleep by automatically reconnecting to the original session.

`collect_custom(label, payload, app_version)`
Sends data to the server with a custom payload and label. Payload should be a JSON object.

 `collect_userdata(app_version)`
 Starts collection of user session data, this data is sent when user has disconnected.

  

### Endpoints

  

Collected data can be retrieved through these endpoints

- HTTP GET `/status`

Returns the status of the server. If it is responsive the reply is "IS ON"

- HTTP GET `/userdata`

Returns all user data entries in JSON format

- HTTP GET `/userdata/version=X`

Returns all user data matching version X in JSON format

- HTTP GET `/custom`

Returns all data from custom data collection in JSON format

- HTTP GET `/custom/version=X`

Returns all data from custom data collection matching version X in JSON format