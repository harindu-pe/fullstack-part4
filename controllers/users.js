const bcrypt = require("bcryptjs");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({ username, name, passwordHash });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", (request, response) => {
  User.find({}).then((users) => {
    response.json(users);
  });
});

module.exports = usersRouter;
