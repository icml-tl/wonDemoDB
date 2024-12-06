import { Express, Request, Response } from "express";
const router = require("express").Router();
import { Product } from "../models/product.model.js";
import { Sale } from "../models/sales.model.js";



router.get("/products_sales", async (req: Request, res: Response) => {
  try {
    const salesAggregation = await Sale.aggregate([
      {
        $group: {
          _id: "$ProductID", 
          totalQuantity: { $sum: { $toInt: "$Quantity" } }, 
          totalAmount: { $sum: "$TotalAmount" },
          salesCount: { $sum: 1 }
        }
      }
    ]);
    const products = await Product.find({}).lean();
    const productsWithSales = products.map(product => ({
      ...product,
      sales: salesAggregation.find(s => s._id === product.ProductID) || { 
        totalQuantity: 0,
        totalAmount: 0,
        salesCount: 0
      }
    }));

    res.status(200).json(productsWithSales);
  } catch (e) {
    console.error("Error fetching products with sales:", e);
    res.status(500).send("Error fetching products with sales");
  }
});



export { router };