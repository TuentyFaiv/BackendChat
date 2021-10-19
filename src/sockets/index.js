function socketApi(io, redis) {
  let redisConnected;
  let chatMessages = [];
  redis.once('ready', function () {
    console.log("Redis alredy");

    redisConnected = true;

    // Flush Redis DB
    // redis.flushdb();
  });
  io.on("connection", (socket) => {
    if (redisConnected) {
      redis.get("chat_messages", (err, reply) => {
        if (reply) {
          chatMessages = JSON.parse(reply);
          socket.emit("get messages", JSON.parse(reply));
        }
      });
    }

    socket.emit("connected user", { data: "Connectd", id: socket.id });

    socket.on("private message", (anotherSocketId, msg) => {
      socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });

    socket.on("message", (msg) => {
      chatMessages.push(msg);
      redis.set("chat_messages", JSON.stringify(chatMessages));
      io.emit("message", msg);
    });

    socket.on("disconnect", (reason) => {
      console.log(reason);
    });
  });
}

module.exports = socketApi;