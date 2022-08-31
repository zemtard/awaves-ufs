export var clientSocket = null;
var session_id = null;
var ip = null;

export function connect(sent_ip) {
  //opens connection
  ip = sent_ip;
  clientSocket = new WebSocket("ws://" + ip);
  clientSocket.onmessage = (e) => {
    //receives session after connecting
    console.log("session id: " + e.data);
    session_id = e.data;
  };

  clientSocket.onclose = function () {
    reconnect();
  };
}

export function reconnect() {
  //opens connection
  //SEND SERVER THE WEBSOCKET RECONNECT REQUEST
  clientSocket = new WebSocket("ws://" + ip + "/reconnect?id=" + session_id);

  clientSocket.onclose = function () {
    reconnect();
  };
}

export function disconnect() {
  let msg = {
    collection: 3,
    msg: "user self disconnect",
  };

  clientSocket.send(JSON.stringify(msg));

  //clientSocket.close();

  // session_id = null;
  // ip = null;
  // clientSocket = null;
}

export function collect_custom(label, payload, app_version) {
  //saves data in first collection with a custom payload structure
  let msg = {
    collection: 1,
    label: label,
    payload: payload,
    version: app_version,
  };

  clientSocket.send(JSON.stringify(msg));
}

export function collect_userdata(app_version) {
  //saves data in second collection
  //by calling this you opt in for session data collection
  let msg = {
    collection: 2,
    version: app_version,
  };

  clientSocket.onopen = () => clientSocket.send(JSON.stringify(msg));
}
