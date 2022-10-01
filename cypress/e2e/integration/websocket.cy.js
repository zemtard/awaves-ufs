const socket = require("../../../interface/socket/index.js");

describe("Websocket tests", () => {
  it("Client can connect to the server", async () => {
    socket.connect("localhost:" + Cypress.env("port"));
    await cy.wait(2000);
    expect(socket.clientSocket.readyState).to.equal(1);
  });

  it("Client receives session-id from server", () => {
    expect(socket.session_id).to.be.not.null;
  });

  it("Data can be sent to the server", () => {
    let msg = {
      collection: "test",
      version: "test",
    };
    socket.clientSocket.send(JSON.stringify(msg));
    socket.clientSocket.onmessage = (e) => {
      console.log(e.data);
      expect(e.data).to.contain("TEST REPLY");
    };
  });
});
