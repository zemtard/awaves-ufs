# awaves-ufs

## Description

A system that collects and stores user feedback and user data from Awaves applications. 

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

To integrate the system use awaves-usf front-end interface that directly communicates with this server

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







