const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const userExtractor = require("../utils/middleware").userExtractor;

blogsRouter.get("/", async (request, response) => {
  try {
    const user = request.user;
  } catch (error) {}

  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });

  response.json(blogs);
});

blogsRouter.post("/", userExtractor, async (request, response, next) => {
  const body = request.body;

  try {
    const user = request.user;

    const newBlogPost = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    };
    const blog = new Blog(newBlogPost);
    const result = await blog.save();
    user.blogs = user.blogs.concat(result._id);

    await user.save();
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", userExtractor, async (request, response, next) => {
  try {
    const user = request.user;

    const blog = await Blog.findById(request.params.id);

    if (blog.user.toString() === user._id.toString()) {
      console.log("Blog deleted");
      await Blog.findByIdAndDelete(request.params.id);
      response.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", userExtractor, async (request, response, next) => {
  try {
    const body = request.body;
    const user = request.user;

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    response.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
