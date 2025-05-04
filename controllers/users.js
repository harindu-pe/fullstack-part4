const usersRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

usersRouter.post("/", async (request, response, next) => {
  try {
    const { username, name, password } = request.body;

    if (password.length < 3) {
      return response
        .status(400)
        .json({ error: "Password must be at least 3 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ username, name, passwordHash });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } catch (error) {
    next(error); // Passes error to the error handler
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);

  // User.find({}).then((users) => {
  //   response.json(users);
  // });
});

module.exports = usersRouter;
