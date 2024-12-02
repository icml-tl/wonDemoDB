import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as productRouter } from './mongoDb/routes/product.router.js';
import { router as salesRouter } from './mongoDb/routes/sales.router.js';



dotenv.config();

const MongoDB_Connection_String = process.env.MONGO_URI || 'mongodb://localhost:27017/wonDb'; 

async function connectToMongoDB(connectionString: string) {
  try {
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");
    const db = mongoose.connection;
    console.log(`Connected to database: ${db.name}`);
  } catch (e) {
    console.error("Error connecting to MongoDB: ", e);
  }
}


connectToMongoDB(MongoDB_Connection_String);

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// api routes 

app.use('/api', productRouter);  

app.use('/api', salesRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).send("Hello World of numeric");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
