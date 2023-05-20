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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.deleteMe = exports.updateMe = exports.getMe = exports.getAllUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const handlerFactory_1 = require("./handlerFactory");
// interface MulterFile extends Express.Multer.File {
//     buffer: Buffer;
// }
// const multerStorage: StorageEngine = multer.memoryStorage();
// const multerFilter = (
//     req: Request,
//     file: MulterFile,
//     callback: (error: Error | null, acceptFile: boolean) => void
// ) => {
//     if (file.mimetype.startsWith('image')) {
//         callback(null, true);
//     } else {
//         callback(new AppError('Not an image! please upload only images', 400), false);
//     }
// };
// // @ts-ignore
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
// const filterObj = (obj: any, ...allowedFields: string[]) => {
//     const newObj: any = {};
//     Object.keys(obj).forEach((el) => {
//         if (allowedFields.includes(el)) newObj[el] = obj[el];
//     });
//     return newObj;
// };
// export const uploadUserPhoto = upload.single('photo');
// export const resizeUserPhoto = async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.file) return next();
//     // @ts-ignore
//     req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
//     await sharp(req.file.buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`public/img/users/${req.file.filename}`);
//     next();
// };
exports.getAllUsers = (0, handlerFactory_1.getAll)(user_1.default);
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    req.params.id = req.user.id;
    next();
});
exports.getMe = getMe;
const updateMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.file);
    console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.default('This route is not for password updates', 400));
    }
    // const filteredBody = filterObj(req.body, 'name', 'email');
    // if (req.file) filteredBody.photo = req.file.filename;
    // @ts-ignore
    const updatedUser = yield user_1.default.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    return res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});
exports.updateMe = updateMe;
exports.deleteMe = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    yield user_1.default.findByIdAndUpdate(req.user.id, { active: false });
    return res.status(204).json({
        status: 'success',
        data: null,
    });
}));
exports.getUser = (0, handlerFactory_1.getOne)(user_1.default);
const createUser = (req, res) => {
    return res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead',
    });
};
exports.createUser = createUser;
exports.updateUser = (0, handlerFactory_1.updateOne)(user_1.default);
exports.deleteUser = (0, handlerFactory_1.deleteOne)(user_1.default);
