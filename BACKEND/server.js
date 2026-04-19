const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const utilityModel = require("./models/utility.model");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  },
});

// expose io globally for controllers
global.io = io;

const connectedProviders = {};
const connectedUsers = {};

io.on("connection", (socket) => {

  socket.on("registerProvider", async (providerId) => {
    connectedProviders[providerId] = socket.id;
    try {
      await utilityModel.findByIdAndUpdate(providerId, {
        socketId: socket.id,
      });
    } catch (err) {
      console.error("Error updating provider socket:", err.message);
    }
  });

  socket.on("registerUser", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on("disconnect", async () => {
    const providerId = Object.keys(connectedProviders).find(
      (key) => connectedProviders[key] === socket.id
    );
    if (providerId) {
      delete connectedProviders[providerId];
      try {
        await utilityModel.findByIdAndUpdate(providerId, {
          socketId: null,
        });
      } catch (err) {
        console.error("Error updating provider on disconnect:", err.message);
      }
    }

    const userId = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key] === socket.id
    );
    if (userId) {
      delete connectedUsers[userId];
    }
  });
});


const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});

module.exports = app;
