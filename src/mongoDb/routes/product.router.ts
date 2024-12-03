import { Express, Request, Response } from "express";
const router = require("express").Router();
import { Product } from "../models/product.model.js";



router.get("/products", async (req: Request, res: Response) => {
  try {
    const data = await Product.find({}).lean();  
    console.log("Data retrieved:", data);  
    res.status(200).json(data);
  } catch (e) {
    console.error("Error fetching products:", e);
    res.status(500).send("Error fetching products");
  }
});

//  top 3 selled products


export { router };