import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from "express-rate-limit"
import postRouter from './routes/postRoute'
import userRouter from './routes/userRoute'
import likeRouter from './routes/likeRoute'
import commentRouter from './routes/commentRoute'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import http from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app: Express = express();
const socketServer = http.createServer(app);
const io = new Server(socketServer);



const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});



app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/like', likeRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

const DB = process.env.DATABASE!

mongoose.connect(DB, {}).then(() => {
  console.log('DB connection successfully');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const socketPort = 3001
socketServer.listen(socketPort, () => {
  console.log(`Socket is running on port ${socketPort}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 💥 Shutting down...');

  server.close(() => {
    process.exit(1);
  });
});
