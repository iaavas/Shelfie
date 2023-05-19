import express from 'express';
import { likePost } from '../controllers/postController';
import { protect, restrictTo } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(protect);



router
    .route('/:id')
    .patch(
        restrictTo('user'),
        likePost
    )


export default router;
