import express from 'express';

import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
    restrictTo,
} from '../controllers/authController';
import {
    getMe,
    getUser,
    uploadUserPhoto,
    resizeUserPhoto,
    updateMe,
    deleteMe,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/userController';

const router = express.Router({ mergeParams: true });

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', protect, updatePassword);
router.get('/me', protect, getMe, getUser);

router.patch('/updateMe', protect, uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.use(restrictTo('admin'));

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;
