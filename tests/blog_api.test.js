const { test, after, beforeEach } = require("node:test");
const bcrypt = require("bcryptjs");
const BlogPost = require("../models/blog");
const User = require("../models/user");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);
const assert = require("node:assert");

const initialBlogPosts = [
  {
    title: "Blog Post 1",
    author: "Blaze",
    url: "Blog URL",
    likes: 1,
  },
  {
    title: "Blog Post 2",
    author: "The Other Blaze",
    url: "Blog URL",
    likes: 5,
  },
];

beforeEach(async () => {
  await BlogPost.deleteMany({});
  let blogPostObject = new BlogPost(initialBlogPosts[0]);
  await blogPostObject.save();
  blogPostObject = new BlogPost(initialBlogPosts[1]);
  await blogPostObject.save();
});

after(async () => {
  await mongoose.connection.close();
});

test("there are two blog posts", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, initialBlogPosts.length);
});

test("blog posts return with id property", async () => {
  const response = await api.get("/api/blogs");

  for (const blog of response.body) {
    assert.ok(blog.id, "Expected blog.id to be defined");
    assert.strictEqual(
      blog._id,
      undefined,
      "Expected blog._id to be undefined"
    );
  }
});

test("a valid blog post can be added", async () => {
  const newBlogPost = {
    title: "Blog Post 3",
    author: "The Other Other Blaze",
    url: "Blog URL",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .send(newBlogPost)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const titles = response.body.map((r) => r.title);

  assert.strictEqual(response.body.length, initialBlogPosts.length + 1);

  assert(titles.includes("Blog Post 1"));
});

test("likes default to 0 if missing", async () => {
  const newBlogPost = {
    title: "Blog Post 4",
    author: "The Other Other Blaze",
    url: "Blog URL",
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlogPost)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.likes, 0);
});

test("responds with 400 if title is missing", async () => {
  const blogWithoutTitle = {
    author: "The Other Other Blaze",
    url: "Blog URL",
    likes: 8,
  };

  const response = await api
    .post("/api/blogs")
    .send(blogWithoutTitle)
    .expect(400);

  assert.strictEqual(response.body.error !== undefined, true);
});

test("responds with 400 if url is missing", async () => {
  const blogWithoutUrl = {
    title: "Blog Post 4",
    author: "The Other Other Blaze",
    likes: 8,
  };

  const response = await api
    .post("/api/blogs")
    .send(blogWithoutUrl)
    .expect(400);

  assert.strictEqual(response.body.error !== undefined, true);
});

test("successfully deletes a blog with valid id", async () => {
  await BlogPost.deleteMany({});

  const newBlogPost = {
    title: "Blog to Delete",
    author: "The Other Other Blaze",
    url: "Blog URL",
    likes: 5,
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlogPost)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  let blogToDeleteId = response.body.id;

  await api.delete(`/api/blogs/${blogToDeleteId}`).expect(204);

  const blogsAfter = await BlogPost.find({});
  assert.strictEqual(blogsAfter.length, 0);
});

test("successfully updates likes of a blog", async () => {
  await BlogPost.deleteMany({});

  const newBlogPost = {
    title: "Blog to Update",
    author: "The Other Other Blaze",
    url: "Blog URL",
    likes: 5,
  };

  const blogToUpdate = await api
    .post("/api/blogs")
    .send(newBlogPost)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  let blogToUpdateId = blogToUpdate.body.id;

  const updatedLikes = { likes: 10 };

  const response = await api
    .put(`/api/blogs/${blogToUpdateId}`)
    .send(updatedLikes)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.likes, 10);
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ username: "root", passwordHash });

    await user.save();
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
});
