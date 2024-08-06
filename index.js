import express from 'express';
import cors from 'cors';
import router from './routes/useRoutes.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import formData from 'express-form-data';
import bodyParser from 'body-parser';
import session from 'express-session';
// import passport from 'passport';
const sessionMiddleware = session({
  key: 'id',
  secret: process.env.jwt_secret_key,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // Secure only in production
    sameSite: 'none', // Adjust for compatibility if needed
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

async function connectDb(DATABASE_URL) {
  try {
    const DB_options = {
      dbname: 'shivam',
    };
    await mongoose.connect(DATABASE_URL, DB_options);
    console.log('Database Connected........');
  } catch (error) {
    console.log(error);
  }
}

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

connectDb(DATABASE_URL);

const corsOptions = {
  origin:process.env.frontend_url,
  // origin:'*',
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(formData.parse());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use('/api/users', router);
app.listen(port, () => {
  console.log(`listening port on ${port}`);
});
