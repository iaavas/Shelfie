"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const likeRoute_1 = __importDefault(require("./routes/likeRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP,please try again in an hour',
});
app.use('/api', limiter);
app.use(express_1.default.json({ limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use('/api/v1/users', userRoute_1.default);
app.use('/api/v1/posts', postRoute_1.default);
app.use('/api/v1/comment', commentRoute_1.default);
app.use('/api/v1/like', likeRoute_1.default);
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
const DB = process.env.DATABASE;
mongoose_1.default.connect(DB, {}).then(() => {
    console.log('DB connection successfully');
});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION 💥 Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});
