// Dependencies
const tls = require("tls");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

// Environment variables
require("dotenv").config();

const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 4000;
const redis_url = dev ? process.env.REDIS_URL : process.env.REDIS_TLS_URL;

// Routes and sockets
const routerApi = require("./src/routes");
const socketApi = require("./src/sockets");

// Middlewares
const { logErrors, errorHandler, boomErrorHandler } = require("./src/middlewares/error.handler");

// Express
const app = express();
const httpServer = createServer(app);
// Socket.io
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: ["*"]
  }
});
// Redis
const pubClient = createClient(redis_url, dev ? {} : {
  tls: tls.connect(port, {
    enableTrace: true
  })
});
const subClient = pubClient.duplicate();

// Socket.io adapters
io.adapter(createAdapter(pubClient, subClient));

// Middlewares executions
app.use(express.json());

// Routes and sockets executions
app.get("/home", (req, res) => {
  res.send("Hello world");
});

routerApi(app);
socketApi(io, pubClient);

// Middlewares errors executions
app.use(boomErrorHandler);
app.use(logErrors);
app.use(errorHandler);

// Server on
httpServer.listen(port, () => {
  console.log(`Server at port: ${port}`);
});
