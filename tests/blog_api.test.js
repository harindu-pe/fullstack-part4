const { test, after, beforeEach } = require("node:test");
const BlogPost = require("../models/blog");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

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
