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

    likedBy: [{
        type: String,


    }],

    createdAt: { type: Date, default: Date.now },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})


PostSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id',
});


const Post = models.Post || model("Post", PostSchema)

export default Post;
