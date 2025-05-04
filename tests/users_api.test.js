const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const helper = require("./test_helper");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("sekret", salt);

    const user = new User({
      username: "root",
      name: "root",
      passwordHash,
    });

    await user.save();
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("responds with 400 if username is missing", async () => {
    const newUser = {
      username: "",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    assert.strictEqual(response.body.error !== undefined, true);
  });

  test("responds with 400 if password is missing", async () => {
    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    assert.strictEqual(response.body.error !== undefined, true);
  });

  test("responds with 400 if username is not unique", async () => {
    const newUser = {
      username: "root",
      name: "root",
      password: "password",
    };

    await api.post("/api/users").send(newUser);

    const response = await api.post("/api/users").send(newUser).expect(400);

    assert.strictEqual(response.body.error !== undefined, true);
  });
});
