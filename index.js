const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const routerApi = require("./src/routes");
const socketApi = require("./src/sockets");

const { logErrors, errorHandler, boomErrorHandler } = require("./src/middlewares/error.handler");

const port = 4000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: ["*"]
  }
});
const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

app.use(express.json());

app.get("/home", (req, res) => {
  res.send("Hello world");
});

routerApi(app);
socketApi(io, pubClient);

app.use(boomErrorHandler);
app.use(logErrors);
app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`Server at port: ${port}`);
});
