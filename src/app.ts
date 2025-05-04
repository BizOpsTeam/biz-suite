import express, { Request, Response } from 'express';
import cookieParser from "cookie-parser"
import cors from "cors"
import notFoundHandler from "./middlewares/notFoundHandler"
import errorHandler from "./middlewares/errorHandler"
import adminRoutes from "./routes/admin.routes"
import authRoutes from './routes/auth.routes';
import { setupSwagger } from './swagger';


const app = express();
app.use(express.json());
app.use(cookieParser());

//setup Swagger docs
setupSwagger(app)

//----------------cors config-----------------------//
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
})) //::todo update the cors to match expected fronted endpoints


//-------------routes-------------------------//
//-------auth routes---------//
app.use('/auth', authRoutes)

//---admin route-----//
app.use('/admin', adminRoutes)


//---------------error handling---------------------//
app.use(notFoundHandler)
app.use(errorHandler)

export default app;

