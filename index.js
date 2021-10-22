// Dependencies
const tls = require("tls");
const cors = require("cors");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

// Environment variables
require("dotenv").config();

const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 4000;
const redisTls = process.env.REDIS_TLS === "true";
const redisUrl = !redisTls ? process.env.REDIS_URL : process.env.REDIS_TLS_URL;
const whitelist = process.env.WHITE_LIST.toString().split(",");
const whitelistSocket = process.env.WHITE_LIST_SOCKETS.toString().split(",");

// Routes and sockets
const routerApi = require("./src/routes");
const socketApi = require("./src/sockets");

// Middlewares
const { logErrors, errorHandler, boomErrorHandler } = require("./src/middlewares/error.handler");

// Express
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("not allowed"));
    }
  }
};
const app = express();
const httpServer = createServer(app);
// Socket.io
const io = new Server(httpServer, {
  transports: ["websocket"],
  allowRequest: (req, callback) => {
    if (whitelistSocket.includes(req.headers.origin) || !req.headers.origin) {
      callback(null, true);
    } else {
      callback("not allowed", false);
    }
  }
});
// Redis
const redisLocal = { host: "localhost", port: 6379 };
// const redisConfig = (dev && !redisTls) ? {} : {
//   tls: tls.connect(port, {
//     enableTrace: true
//   })
// };
const pubClient = dev ? createClient(redisLocal) : createClient(redisUrl);
const subClient = pubClient.duplicate();

// Socket.io adapters
io.adapter(createAdapter(pubClient, subClient));

// Middlewares executions
app.use(express.json());
app.use(cors(corsOptions));

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
