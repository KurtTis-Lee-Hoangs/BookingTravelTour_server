import Post from "../models/Post.js";

// Create new post or tip
export const createPost = async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).json({
      success: true,
      message: "Create post successfully",
      data: savedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Create post failed",
    });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Sussessfully updated the post",
      data: updatedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed update a post. Try again",
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;

  try {
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully delete the post",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed delete a post. Try again",
    });
  }
};

// Get single post or tip
export const getSinglePost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id);

    res.status(200).json({
      success: true,
      message: "Get post successfully",
      data: post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Get post failed. Not found post",
    });
  }
};

// Get all post or tip
export const getAllPostByUser = async (req, res) => {
  // pagianaion
  const page = parseInt(req.query.page);

  try {
    const posts = await Post.find({})
      .skip(page * 8)
      .limit(8);

    res.status(200).json({
      success: true,
      count: posts.length,
      message: "Sussessfully get all tours",
      data: posts,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the tours. Try again",
    });
  }
};

// Get all post by admin
export const getAllPostByAdmin = async (req, res) => {
  try {
    const posts = await Post.find({})

    res.status(200).json({
      success: true,
      count: posts.length,
      message: "Sussessfully get all posts",
      data: posts,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the post. Try again",
    });
  }
};

// get post counts
export const getPostCount = async (req, res) => {
  try {
    const postCount = await Post.estimatedDocumentCount();

    res.status(200).json({
      success: true,
      data: postCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch",
    });
  }
};
