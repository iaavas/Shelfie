import multer, { StorageEngine } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { getAll, getOne, updateOne, deleteOne } from './handlerFactory';

interface MulterFile extends Express.Multer.File {
    buffer: Buffer;
}

const multerStorage: StorageEngine = multer.memoryStorage();

const multerFilter = (
    req: Request,
    file: MulterFile,
    callback: (error: Error | null, acceptFile: boolean) => void
) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    } else {
        callback(new AppError('Not an image! please upload only images', 400), false);
    }
};

// @ts-ignore
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};


export const uploadUserPhoto = upload.single('photo');
export const resizeUserPhoto = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    // @ts-ignore
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};

export const getAllUsers = getAll(User);

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    req.params.id = req.user.id;
    next();
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file);
    console.log(req.body);

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates', 400));
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;


    // @ts-ignore
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
};

export const deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

export const getUser = getOne(User);
export const createUser = (req: Request, res: Response) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead',
    });
};
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
