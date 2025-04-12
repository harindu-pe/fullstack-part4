const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);

const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

app.use(errorHandler);

module.exports = app;
