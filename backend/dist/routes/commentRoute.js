"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router({ mergeParams: true });
router.use(authController_1.protect);
router
    .route('/')
    .get(commentController_1.getAllComments)
    .post((0, authController_1.restrictTo)('user'), commentController_1.setPostUserIds, commentController_1.createComment);
router
    .route('/:id')
    .get(commentController_1.getComment)
    .patch((0, authController_1.restrictTo)('user', 'admin'), commentController_1.updateComment)
    .delete((0, authController_1.restrictTo)('user', 'admin'), commentController_1.deleteComment);
exports.default = router;
