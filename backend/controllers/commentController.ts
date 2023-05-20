import Comment from '../models/comment';
import { Request, Response, NextFunction } from 'express';
import { createOne, getAll, getOne, updateOne, deleteOne } from './handlerFactory';

export const setPostUserIds = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.post) req.body.post = req.params.postId;
    // @ts-ignore
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

export const createComment = createOne(Comment);

export const getAllComments = getAll(Comment);
export const getComment = getOne(Comment);

export const updateComment = updateOne(Comment);
export const deleteComment = deleteOne(Comment);
