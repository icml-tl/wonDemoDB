import { Express, Request, Response } from "express";
import { Sale } from "../models/sales.model.js";
import { Product } from "../models/product.model.js";
const router = require("express").Router();

router.get("/sales", async (req: Request, res: Response) => {
  try {
    // Get page and limit (size) from query parameters
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.size as string) || 100;

    if (limit > 1000) {
      return res.status(400).json({
        message: "Limit cannot exceed 1000. Please adjust the limit.",
      });
    }
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;
    const data = await Sale.find({}).lean().skip(skip).limit(limit);
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


router.get("/analytics/total_sales", async (req: Request, res: Response): Promise<Response> => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Les dates startDate et endDate sont obligatoires" });
    }
    const from = new Date(startDate);
    const to = new Date(endDate);
    // Validate date range
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ error: "Les dates startDate et endDate doivent être valides" });
    }
    const totalSales = await Sale.aggregate([
      {
        $match: {
          Date: { 
            $gte: from, 
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$TotalAmount" },
        },
      },
    ]);
    // If no sales are found, return 0
    if (!totalSales || totalSales.length === 0) {
      return res.status(200).json({ totalSales: 0 });
    }
    return res.status(200).json({ totalSales: totalSales[0].totalAmount });
  } catch (e) {
    console.error("Erreur lors de la récupération des ventes :", e);
    return res.status(500).send("Erreur serveur");
  }
});


router.get("/analytics/trending_products", async (req: Request, res: Response): Promise<Response> => {
  try {
    // MongoDB aggregation to get the top 3 selling products by Quantity
    const topSellingProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$ProductID",  // Group by ProductID
          totalQuantity: { $sum: { $toInt: "$Quantity" } },  // Sum the Quantity for each product
        },
      },
      {
        $sort: { totalQuantity: -1 },  // Sort by totalQuantity in descending order
      },
      {
        $limit: 3,  // Limit to top 3 products
      },
      {
        $project: {
          _id: 0, 
          ProductID: "$_id",  
          totalQuantity: 1,  
        },
      },
    ]);
    // If no top-selling products are found, return an empty array
    if (!topSellingProducts || topSellingProducts.length === 0) {
      return res.status(200).json({ topSellingProducts: [] });
    }
    // Respond with the top-selling products
    return res.status(200).json({ topSellingProducts });
  } catch (e) {
    console.error("Erreur lors de la récupération des produits les plus vendus :", e);
    return res.status(500).send("Erreur serveur");
  }
});


router.get("/analytics/category_sales", async (req: Request, res: Response): Promise<Response> => {
  try {
    const categorySales = await Sale.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "ProductID",
          foreignField: "ProductID",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true //unmatched documents 
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$productDetails.Category", "Uncategorized"] }, // Categorize nulls as "Uncategorized"
          totalSales: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          Category: "$_id",
          totalSales: 1,
        },
      },
    ]);
    const totalSales = await Sale.countDocuments();
    console.log(totalSales); // Check the output
    const unmatchedProductIDs = await Sale.distinct("ProductID", {
      ProductID: { $nin: await Product.distinct("ProductID") }
    });
    console.log("Unmatched ProductIDs in Sales !!!:", unmatchedProductIDs);
    const totalSalesCount = categorySales.reduce((acc, category) => acc + category.totalSales, 0);
    const categorySalesWithPercentage = categorySales.map(category => ({
      Category: category.Category,
      totalSales: category.totalSales,
      percentage: ((category.totalSales / totalSalesCount) * 100).toFixed(2) + '%',
    }));
    return res.status(200).json({
      totalSalesCount,
      categorySales: categorySalesWithPercentage,
    });
  } catch (e) {
    console.error("Error retrieving sales data:", e);
    return res.status(500).json({ message: "Server error while retrieving sales data." });
  }
});

export { router };
