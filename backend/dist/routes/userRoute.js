"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router({ mergeParams: true });
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/forgotPassword', authController_1.forgotPassword);
router.patch('/resetPassword/:token', authController_1.resetPassword);
router.use(authController_1.protect);
router.patch('/updateMyPassword', authController_1.protect, authController_1.updatePassword);
router.get('/me', authController_1.protect, userController_1.getMe, userController_1.getUser);
router.patch('/updateMe', authController_1.protect, userController_1.updateMe);
router.delete('/deleteMe', authController_1.protect, userController_1.deleteMe);
router.use((0, authController_1.restrictTo)('admin'));
router
    .route('/')
    .get(userController_1.getAllUsers)
    .post(userController_1.createUser);
router
    .route('/:id')
    .get(userController_1.getUser)
    .patch(userController_1.updateUser)
    .delete(userController_1.deleteUser);
exports.default = router;
