let chatMessages = [];

function socketMessages(io, socket, redis, redisConnected) {
  if (redisConnected) {
    redis.get("chat_messages", (err, reply) => {
      if (reply) {
        chatMessages = JSON.parse(reply);
        socket.emit("get messages", JSON.parse(reply));
      }
    });
  }

  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });

  socket.on("message", (msg) => {
    chatMessages.push(msg);
    redis.set("chat_messages", JSON.stringify(chatMessages));
    io.emit("message", msg);
  });
}

module.exports = socketMessages;