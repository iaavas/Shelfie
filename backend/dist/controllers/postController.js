"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.deletePost = exports.updatePost = exports.getPost = exports.getAllPosts = exports.createPost = void 0;
const post_1 = __importDefault(require("./../models/post"));
const handlerFactory_1 = require("./handlerFactory");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.createPost = (0, handlerFactory_1.createOne)(post_1.default);
exports.getAllPosts = (0, handlerFactory_1.getAll)(post_1.default);
exports.getPost = (0, handlerFactory_1.getOne)(post_1.default);
exports.updatePost = (0, handlerFactory_1.updateOne)(post_1.default);
exports.deletePost = (0, handlerFactory_1.deleteOne)(post_1.default);
exports.likePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = req.query.id;
    const post = yield post_1.default.findById(id);
    if (!post) {
        return new Response('Post Not Found', { status: 400 });
    }
    if (post.likedBy.includes(userId)) {
        yield post_1.default.findByIdAndUpdate(id, { $inc: { likes: -1 }, $pull: { likedBy: userId } }, { new: true });
        res.status(200).json({
            status: 'Unliked'
        });
    }
    yield post_1.default.findByIdAndUpdate(id, { $inc: { likes: 1 }, $push: { likedBy: userId } }, { new: true });
    res.status(200).json({
        status: 'Liked'
    });
}));
