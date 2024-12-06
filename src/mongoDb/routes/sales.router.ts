import { Request, Response } from "express";
import { Sale } from "../models/sales.model.js";
const router = require("express").Router();

router.get("/sales", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.size as string) || 100;

    if (limit > 1000) {
      return res.status(400).json({
        message: "Limit cannot exceed 1000. Please adjust the limit.",
      });
    }

    if (!req.query.page && !req.query.size) {
      // if no pagination return total pages only
      const totalSalesCount = await Sale.countDocuments();
      res.status(200).json({ totalSalesCount });
      return;
    } else {
      const skip = (page - 1) * limit;
      const data = await Sale.find({}).lean().skip(skip).limit(limit);
      const totalCount = await Sale.countDocuments({});
      console.log("Data retrieved:", data);
      res.status(200).json({
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        data,
      });
    }
  } catch (e) {
    console.log("Error fetching sales data:", e);
    res.status(500).send("Error fetching sales data");
  }
});





export { router };
