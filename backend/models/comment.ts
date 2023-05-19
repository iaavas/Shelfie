import { Schema, model, models } from 'mongoose'


const commentSchema = new Schema(
    {
        comment: {
            type: String,
        },


        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: [true, 'Comment must belong to a post'],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Comment must belong to a user'],
        },
        createdAt: { type: Date, default: Date.now },

    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


const Comment = models.Comment || model('Comment', commentSchema);

export default Comment;
