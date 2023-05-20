"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getComment = exports.getAllComments = exports.createComment = exports.setPostUserIds = void 0;
const comment_1 = __importDefault(require("../models/comment"));
const handlerFactory_1 = require("./handlerFactory");
const setPostUserIds = (req, res, next) => {
    if (!req.body.post)
        req.body.post = req.params.postId;
    // @ts-ignore
    if (!req.body.user)
        req.body.user = req.user.id;
    next();
};
exports.setPostUserIds = setPostUserIds;
exports.createComment = (0, handlerFactory_1.createOne)(comment_1.default);
exports.getAllComments = (0, handlerFactory_1.getAll)(comment_1.default);
exports.getComment = (0, handlerFactory_1.getOne)(comment_1.default);
exports.updateComment = (0, handlerFactory_1.updateOne)(comment_1.default);
exports.deleteComment = (0, handlerFactory_1.deleteOne)(comment_1.default);
