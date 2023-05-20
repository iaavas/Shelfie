"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    tag: {
        type: String,
        required: [true, 'Tag is required']
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    likedBy: [{
            type: String,
        }],
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
PostSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id',
});
const Post = mongoose_1.models.Post || (0, mongoose_1.model)("Post", PostSchema);
exports.default = Post;
