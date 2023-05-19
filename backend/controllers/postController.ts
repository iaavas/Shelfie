import { Request, Response, NextFunction } from 'express';
import Post from './../models/post';
import { createOne, getAll, getOne, updateOne, deleteOne } from './handlerFactory';
import catchAsync from '../utils/catchAsync';

export const createPost = createOne(Post);

export const getAllPosts = getAll(Post);
export const getPost = getOne(Post);

export const updatePost = updateOne(Post);
export const deletePost = deleteOne(Post);


export const likePost = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const userId = req.query.id;

    const post = await Post.findById(id);

    if (!post) {
        return new Response('Post Not Found', { status: 400 });
    }



    if (post.likedBy.includes(userId)) {
        await Post.findByIdAndUpdate(
            id,
            { $inc: { likes: -1 }, $pull: { likedBy: userId } },
            { new: true }
        );

        res.status(200).json({
            status: 'Unliked'
        });
    }

    await Post.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 }, $push: { likedBy: userId } },
        { new: true }
    );

    res.status(200).json({
        status: 'Liked'
    });



})
