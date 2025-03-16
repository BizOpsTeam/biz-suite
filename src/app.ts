import express, { Request, Response } from 'express';
import dotenv from "dotenv"
import cors from "cors"
import notFoundHandler from "./middlewares/notFoundHandler"
import errorHandler from "./middlewares/errorHandler"
import adminRoutes from "./routes/admin.routes"
import authRoutes from './routes/auth.routes';


const app = express();
app.use(express.json());

//----------------cors config-----------------------//
app.use(cors({
  origin: ["*"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
})) //::todo update the cors to match expected fronted endpoints


//-------------routes-------------------------//
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

//-------auth routes---------//
app.use('/auth', authRoutes)

//---admin route-----//
app.use('/admin', adminRoutes)


//---------------error handling---------------------//
app.use(notFoundHandler)
app.use(errorHandler)

export default app;

