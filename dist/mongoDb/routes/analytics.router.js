"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const sales_model_js_1 = require("../models/sales.model.js");
const router = require("express").Router();
exports.router = router;
router.get("/total_sales", async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Les dates startDate et endDate sont obligatoires" });
        }
        const from = new Date(startDate);
        const to = new Date(endDate);
        // Validate date range
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return res.status(400).json({ error: "Les dates startDate et endDate doivent être valides" });
        }
        const totalSales = await sales_model_js_1.Sale.aggregate([
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
    }
    catch (e) {
        console.error("Erreur lors de la récupération des ventes :", e);
        return res.status(500).send("Erreur serveur");
    }
});
router.get("/trending_products", async (req, res) => {
    try {
        const topSellingProducts = await sales_model_js_1.Sale.aggregate([
            {
                $group: {
                    _id: "$ProductID", // Group by ProductID
                    totalQuantity: { $sum: { $toInt: "$Quantity" } }, // Sum the Quantity for each product
                },
            },
            {
                $sort: { totalQuantity: -1 }, // Sort by totalQuantity in descending order
            },
            {
                $limit: 3,
            },
            {
                $project: {
                    _id: 0,
                    ProductID: "$_id",
                    totalQuantity: 1,
                },
            },
        ]);
        // no topSellingProducts are found
        if (!topSellingProducts || topSellingProducts.length === 0) {
            return res.status(200).json({ topSellingProducts: [] });
        }
        return res.status(200).json({ topSellingProducts });
    }
    catch (e) {
        console.error("Erreur lors de la récupération des produits les plus vendus :", e);
        return res.status(500).send("Erreur serveur");
    }
});
router.get("/category_sales", async (req, res) => {
    try {
        const categorySales = await sales_model_js_1.Sale.aggregate([
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
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: { $ifNull: ["$productDetails.Category", "Uncategorized"] },
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
        const totalSalesCount = await sales_model_js_1.Sale.countDocuments();
        const categorySalesWithPercentage = categorySales.map(category => ({
            Category: category.Category,
            totalSales: category.totalSales,
            percentage: ((category.totalSales / totalSalesCount) * 100).toFixed(2) + '%',
        }));
        return res.status(200).json({
            totalSalesCount,
            categorySales: categorySalesWithPercentage,
        });
    }
    catch (e) {
        console.error("Error retrieving sales data:", e);
        return res.status(500).json({ message: "Server error while retrieving sales data." });
    }
});
router.get("/products_Retourne", async (req, res) => {
    try {
        const productReturn = await sales_model_js_1.Sale.aggregate([
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
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: "$ProductID",
                    totalSales: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    ProductID: "$_id",
                    totalSales: 1,
                },
            },
        ]);
        const totalSalesCount = await sales_model_js_1.Sale.countDocuments();
        let salesPerProduct = productReturn.map(product => ({
            ProductID: product.ProductID,
            totalSales: product.totalSales,
        }));
        return res.status(200).json({ salesPerProduct, totalSalesCount });
    }
    catch (e) {
        console.error("Error retrieving sales data:", e);
        return res.status(500).json({ message: "Server error while retrieving sales data." });
    }
});
router.get("/products_sells", async (req, res) => {
    try {
        const productName = req.query.productName;
        if (!productName) {
            return res.status(400).json({ error: "productName is required" });
        }
        const productSells = await sales_model_js_1.Sale.aggregate([
            {
                $addFields: {
                    ProductID: { $toString: "$ProductID" },
                    Quantity: { $toInt: "$Quantity" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "ProductID",
                    foreignField: "ProductID",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $match: {
                    "productDetails.ProductName": { $regex: new RegExp(productName, "i") },
                },
            },
            {
                $addFields: {
                    TotalAmount: { $multiply: ["$Quantity", "$productDetails.Price"] },
                }
            },
            {
                $group: {
                    _id: "$productDetails.ProductName",
                    totalSales: { $sum: "$Quantity" },
                    totalRevenue: { $sum: "$TotalAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    ProductName: "$_id",
                    totalSales: 1,
                    totalRevenue: 1,
                },
            },
        ]);
        const totalSalesCount = await sales_model_js_1.Sale.countDocuments();
        let selesPerProduct = productSells.map(product => ({
            ProductName: product.ProductName,
            totalSales: product.totalSales,
            totalRevenue: product.totalRevenue,
        }));
        return res.status(200).json({ selesPerProduct, totalSalesCount });
    }
    catch (e) {
        console.error("Error retrieving sales data:", e);
        return res.status(500).json({ message: "Server error while retrieving sales data." });
    }
});
//# sourceMappingURL=analytics.router.js.map