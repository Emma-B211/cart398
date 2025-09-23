// Minimal WebSocket → OSC bridge for Wekinator
// Run: node bridge.js

const WebSocket = require("ws");
const osc = require("osc");

const wss = new WebSocket.Server({ port: 8081 });
console.log("WebSocket server up on ws://localhost:8081");

// Setup OSC client
const udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 57121, // Any free port
  remoteAddress: "127.0.0.1",
  remotePort: 6448, // Wekinator listens here
});

udpPort.open();

wss.on("connection", (ws) => {
  console.log("Browser connected ✅");

  ws.on("message", (msg) => {
    try {
      let data = JSON.parse(msg.toString()); // [nx, ny]
      console.log("Received pose:", data);

      // Send OSC message to Wekinator
      udpPort.send(
        {
          address: "/wek/inputs",
          args: data,
        },
        "127.0.0.1",
        6448
      );
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });
});