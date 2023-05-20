"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.protect = exports.login = exports.signup = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("./../models/user"));
const catchAsync_1 = __importDefault(require("./../utils/catchAsync"));
const appError_1 = __importDefault(require("./../utils/appError"));
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 3600 * 1000),
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
exports.signup = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield user_1.default.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    createSendToken(newUser, 201, res);
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default('Please provide email and password!', 400));
    }
    const user = yield user_1.default.findOne({ email }).select('+password');
    console.log(user);
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect email or password', 401));
    }
    createSendToken(user, 201, res);
}));
exports.protect = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default('You are not logged in! Please log in to get access ', 401));
    }
    const decoded = yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const freshUser = yield user_1.default.findById(decoded.id);
    console.log(freshUser);
    if (!freshUser)
        return next(new appError_1.default('The user belonging to the token no longer exists', 401));
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError_1.default('User recently changed password! Please log in again', 401));
    }
    // @ts-ignore
    req.user = freshUser;
    next();
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // @ts-ignore
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email: req.body.email });
    if (!user)
        return next(new appError_1.default('There is no user with the email address', 404));
    const resetToken = user.createPasswordResetToken();
    console.log('asasas');
    yield user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to ${resetUrl}`;
    try {
        // sendEmail implementation goes here
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new appError_1.default('There was an error sending the email', 500));
    }
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
    });
});
exports.forgotPassword = forgotPassword;
exports.resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = yield user_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
        return next(new appError_1.default('Token Expired', 401));
    user.password = req.body.password;
    user.passwordConfirm = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        token,
    });
}));
exports.updatePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = yield user_1.default.findById(req.user.id).select('+password');
    if (!(yield (user === null || user === void 0 ? void 0 : user.correctPassword(req.body.passwordCurrent, user === null || user === void 0 ? void 0 : user.password)))) {
        return next(new appError_1.default('Your current password is wrong.', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    yield (user === null || user === void 0 ? void 0 : user.save());
    // createSendToken implementation goes here
}));
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies.jwt) {
        try {
            const decoded = jsonwebtoken_1.default.verify(req.cookies.jwt, process.env.JWT_SECRET);
            const currentUser = yield user_1.default.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            return next();
        }
    }
    next();
});
exports.isLoggedIn = isLoggedIn;
