const express = require("express");
const faker = require("faker");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hola users");
});

module.exports = router;