import { Schema, model, models } from 'mongoose'


const PostSchema = new Schema({

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

    createdAt: { type: Date, default: Date.now },

    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'

    }



}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})









const Post = models.Post || model("Post", PostSchema)

export default Post;
