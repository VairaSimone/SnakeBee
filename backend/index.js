import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './routes/Auth.router.js';
import passport from 'passport';
import userRouter from './routes/User.router.js';
import reptileRouter from './routes/Reptile.router.js';
import feedingRouter from './routes/Feeding.router.js';
import breedingRouter from './routes/Breeding.router.js';
import './config/FeedingJob.js';
import './config/RemoveTokenJob.js';
import notificationRouter from './routes/Notification.router.js';
import forum from './routes/Forum.router.js';
import googleStrategy from './config/Passport.config.js ';
import './config/RetryFailedEmails.js';
import cloudinaryRouter from './routes/Cloudinary.router.js';
import foodInventoryRoute from './routes/FoodInventory.router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT
const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  methods: ['GET', 'POST', 'OPTIONS', "DELETE", "PUT", "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.set('trust proxy', 1);

const allowedOrigins = [process.env.FRONTEND_URL,   'http://localhost:3000', // sviluppo
  'http://snakebee.it',    // produzione
  'https://snakebee.it',];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser())
app.use(express.json({ limit: '10kb' }));
app.use(morgan("dev"))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-site' })); // o 'same-origin'
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' }));
passport.use("google", googleStrategy)

mongoose
  .connect(process.env.MONGO_STRING)
  .then(() => console.log("Connected database"))
  .catch((err) => console.log(err))
  app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('api/inventory', foodInventoryRoute);
app.use('api/cloudinary', cloudinaryRouter);
app.use("/api/v1/", authRouter)
app.use('api/user', userRouter);
app.use('api/reptile', reptileRouter);
app.use('api/feedings', feedingRouter);
app.use('api/breeding', breedingRouter);
app.use('api/notifications', notificationRouter);
app.use('api/forum', forum);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on ${process.env.BACKEND_URL}:${process.env.PORT}`);

})