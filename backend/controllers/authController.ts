import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from './../models/user';
import catchAsync from './../utils/catchAsync';
import AppError from './../utils/appError';




const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 3600 * 1000
        ),

        httpOnly: true,
    };
    user.password = undefined;


    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 201, res);
});

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token: string;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }



    if (!token!) {
        return next(
            new AppError('You are not logged in! Please log in to get access ', 401)
        );
    }

    const decoded: any = await jwt.verify(token, process.env.JWT_SECRET!);

    const freshUser = await User.findById(decoded.id);

    console.log(freshUser);

    if (!freshUser)
        return next(
            new AppError('The user belonging to the token no longer exists', 401)
        );

    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again', 401)

        );
    }

    // @ts-ignore
    req.user = freshUser


    next();
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    }
}

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return next(new AppError('There is no user with the email address', 404));

    const resetToken = user.createPasswordResetToken();

    console.log('asasas');

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password to ${resetUrl}`;

    try {
        // sendEmail implementation goes here
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
    });
};

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Token Expired', 401));
    user.password = req.body.password;
    user.passwordConfirm = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token,
    });
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user?.correctPassword(req.body.passwordCurrent, user?.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    user!.password = req.body.password;
    user!.passwordConfirm = req.body.passwordConfirm;
    await user?.save();

    // createSendToken implementation goes here
});

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    if (req.cookies.jwt) {
        try {

            const decoded: any = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET!);


            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }


            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }


            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};