"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router({ mergeParams: true });
router.use(authController_1.protect);
router
    .route('/')
    .get(postController_1.getAllPosts)
    .post(postController_1.createPost);
router
    .route('/:id')
    .post(postController_1.createComment)
    .get(postController_1.getPost)
    .patch((0, authController_1.restrictTo)('user'), postController_1.updatePost)
    .delete((0, authController_1.restrictTo)('user'), postController_1.deletePost);
exports.default = router;
