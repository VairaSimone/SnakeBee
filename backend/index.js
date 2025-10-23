import 'dotenv/config';
import "./telegramBot.js"; 
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
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
import "./config/reminders.js";
import "./config/SchedulesInventory.js";
import './config/RemoveTokenJob.js';
import notificationRouter from './routes/Notification.router.js';
import googleStrategy from './config/Passport.config.js ';
import './config/RetryFailedEmails.js';
import foodInventoryRoute from './routes/FoodInventory.router.js';
import path from 'path';
import { fileURLToPath } from 'url';
import stripeRouter from './routes/Stripe.router.js';
import * as stripeController from './controllers/Stripe_controller.js';
import calendar from './routes/Calendar.routes.js';
import newsletterRoute from './routes/newsletter.router.js';
import routerTelegram from './routes/telegramAuth.js';
import blogRouter from './routes/Blog.router.js';
import './config/SchedulesPublishing.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT
const app = express();

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'it',
    preload: ['en', 'it'],
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json')
    }
  });
app.set('trust proxy', 1);

const allowedOrigins = [process.env.FRONTEND_URL,   'http://localhost:3000', "http://82.165.134.168", 
  'http://snakebee.it', 'https://snakebee.it','https://blog-api-ten-flax.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non consentito da CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser())
app.use(middleware.handle(i18next));

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(morgan("dev"))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-site' })); 
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' }));
passport.use("google", googleStrategy)
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_STRING)
  .then(() => console.log("Connected database"))
  .catch((err) => console.log(err))
  app.get('/api/ping', (req, res) => {
  res.status(200).send('OK');
});
app.use('/api/stripe', stripeRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/inventory', foodInventoryRoute);
app.use("/api/v1/", authRouter)
app.use('/api/user', userRouter);
app.use('/api/calendar', calendar);
app.use('/api/telegram', routerTelegram);
app.use("/api/newsletter", newsletterRoute);
app.use('/api/blog', blogRouter);
app.use('/api/reptile', reptileRouter);
app.use('/api/feedings', feedingRouter);
app.use('/api/breeding', breedingRouter);
app.use('/api/notifications', notificationRouter);
app.use((err, req, res, next) => {
  if (err.message === req.t('server_error')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const messages = err.messages || [req.t('server_error')];
  res.status(status).json({ errors: messages });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on ${process.env.BACKEND_URL}:${process.env.PORT}`);

})