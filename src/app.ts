import express, { Request, Response } from 'express';
import cookieParser from "cookie-parser"
import cors from "cors"
import notFoundHandler from "./middlewares/notFoundHandler"
import errorHandler from "./middlewares/errorHandler"
import adminRoutes from "./routes/admin.routes"
import authRoutes from './routes/auth.routes';
import { setupSwagger } from './swagger';
import salesRoutes from './routes/sales.route';
import productsRoutes from './routes/products.routes';
import { authenticateUser } from './middlewares/authenticateUser';
import invoicesRoutes from './routes/invoices.routes';
import userRoutes from './routes/user.routes';
import { isAdmin, isWorker } from './middlewares/verifyUserRole';
import analyticsRoutes from './routes/analytics.routes';


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

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World" })
})

app.get("/healthz", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" })
})

//-------auth routes---------//
app.use('/auth', authRoutes)

//---admin route-----//
app.use('/admin', adminRoutes)

//-------sales routes---------//
app.use('/sales', authenticateUser ,salesRoutes)
app.use('/invoices', authenticateUser, invoicesRoutes)
//-------product routes---------//
app.use('/products', authenticateUser, productsRoutes)

//-------user routes---------//
app.use('/users', authenticateUser, isAdmin, userRoutes)

//-------analytics routes---------//
app.use('/analytics', authenticateUser, isAdmin, analyticsRoutes);

// Not found handler for unmatched routes
app.use(notFoundHandler)

// Error handling middleware should be last
app.use(errorHandler)

export default app;