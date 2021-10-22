const socketMessages = require("./messages");

function socketApi(io, redis) {
  let redisConnected;
  redis.once('ready', function () {
    console.log("Redis alredy");

    redisConnected = true;

    // Flush Redis DB
    // redis.flushdb();
  });
  io.on("connection", (socket) => {
    socket.emit("connected user", { data: "Connectd", id: socket.id });

    socketMessages(io, socket, redis, redisConnected);

    socket.on("disconnect", (reason) => {
      console.log(reason);
    });
  });
}

module.exports = socketApi;