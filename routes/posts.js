import express from "express";
import {
    createPost,
    updatePost,
    deletePost,
    getSinglePost,
    getAllPostByUser,
    getPostCount,
    getAllPostByAdmin,
} from "../controllers/postController.js";

import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// create a new post
router.post("/", verifyAdmin, createPost);

// update a post
router.put("/:id", verifyAdmin, updatePost);

// delete a post
router.delete("/:id", verifyAdmin, deletePost);

// get a single post
router.get("/:id", getSinglePost);

// get all posts
router.get("/user/getAllPostByUser", getAllPostByUser);

// get all tours admin
router.get("/", verifyAdmin, getAllPostByAdmin);

// get post counts
router.get("/search/getPostCount", getPostCount);

export default router;
