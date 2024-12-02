import { Express, Request, Response } from "express";
import { Sale } from "../models/sales.model.js";
const router = require("express").Router();

router.get("/sales", async (req: Request, res: Response) => {
  try {
    // Get page and limit (size) from query parameters
    const page = parseInt(req.query.page as string) || 1; 
    let limit = parseInt(req.query.size as string) || 100;

    if (limit > 1000) {
      return res.status(400).json({
        message: "Limit cannot exceed 1000. Please adjust the limit."
      });
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;
    const data = await Sale.find({})
      .lean()
      .skip(skip)
      .limit(limit);
      
    // Get the total count of documents for pagination info
    const totalCount = await Sale.countDocuments({});
    console.log("Data retrieved:", data);    
    res.status(200).json({
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data,
    });
  } catch (e) {
    console.error("Error fetching sales data:", e);
    res.status(500).send("Error fetching sales data");
  }
});

export { router };
