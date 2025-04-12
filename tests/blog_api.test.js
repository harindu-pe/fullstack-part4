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

test("there are two blog posts", async () => {
  const response = await api.get("/api/blogs");
  console.log(response);
  assert.strictEqual(response.body.length, initialBlogPosts.length);
});
