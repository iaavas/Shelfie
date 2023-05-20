import express from 'express';
import { createPost, getAllPosts, getPost, updatePost, deletePost, createComment } from '../controllers/postController';
import { protect, restrictTo } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getAllPosts)
    .post(
        createPost
    );

router
    .route('/:id')
    .post(createComment)
    .get(getPost)
    .patch(
        restrictTo('user'),
        updatePost
    )
    .delete(
        restrictTo('user'),
        deletePost
    );



export default router;
