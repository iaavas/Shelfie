import { Request, Response, NextFunction } from 'express';
import catchAsync from './../utils/catchAsync';
import AppError from './../utils/appError';
import APIFeatures from './../utils/apiFeatures';
import qs from 'qs';

declare global {
    namespace Express {
        interface Request {
            requestTime?: Date;
        }
    }
}




export const deleteOne = (Model: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndRemove(req.params.id);
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        return res.status(204).json({
            status: 'success',
            data: null,
        });
    });

export const updateOne = (Model: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError('Document with that Id not Found', 404));
        }

        return res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

export const createOne = (Model: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        const doc = await Model.create(req.body);

        return res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

export const getOne = (Model: any, popOptions?: string) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError('Tour not Found', 404));
        }

        return res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
export const getAll = (Model: any) =>
    catchAsync(async (req: Request, res: Response) => {
        console.log("yeta hajur yeta")
        let filter = {};

        if (req.params.tourId) filter = { tour: req.params.tourId };

        const queryString = qs.stringify(req.query);
        const features = new APIFeatures(Model.find(filter), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const docs = await features.query;

        return res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: docs.length,
            data: {
                docs,
            },
        });
    });
