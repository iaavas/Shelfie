import express from 'express';
import {
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
    setPostUserIds
} from '../controllers/commentController';
import { protect, restrictTo } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getAllComments)
    .post(restrictTo('user'), setPostUserIds, createComment);

router
    .route('/:id')
    .get(getComment)
    .patch(restrictTo('user', 'admin'), updateComment)
    .delete(restrictTo('user', 'admin'), deleteComment);

export default router;
