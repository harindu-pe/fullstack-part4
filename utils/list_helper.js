const dummy = (blogs) => {
  // ...
  return 1;
};

const totalLikes = (blogs) => {
  let sum = 0;

  blogs.map((blog) => {
    sum += blog.likes;
  });

  return sum;
};

const favoriteBlog = (blogs) => {
  let highest_likes = 0;
  let highest_likes_id = 0;

  blogs.map((blog) => {
    if (blog.likes > highest_likes) {
      highest_likes = blog.likes;
      highest_likes_id = blog._id;
    }
  });

  const highest_liked_blog = blogs.find(
    (blog) => blog._id === highest_likes_id
  );

  return {
    title: highest_liked_blog.title,
    author: highest_liked_blog.author,
    likes: highest_liked_blog.likes,
  };
};

const mostBlogs = (blogs) => {
  let authorArray = [];

  blogs.map((blog) => {
    authorArray.push(blog.author);
  });

  const countStrings = (arr) => {
    return arr.reduce((acc, str) => {
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {});
  };

  const authorBlogNum = countStrings(authorArray);

  const getLargestPair = (obj) => {
    return Object.entries(obj).reduce((maxPair, currentPair) =>
      currentPair[1] > maxPair[1] ? currentPair : maxPair
    );
  };

  const keyValuePair = getLargestPair(authorBlogNum);

  return { author: keyValuePair[0], blogs: keyValuePair[1] };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
