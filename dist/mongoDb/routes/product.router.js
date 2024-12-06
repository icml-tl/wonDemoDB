"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const router = require("express").Router();
exports.router = router;
const product_model_js_1 = require("../models/product.model.js");
const sales_model_js_1 = require("../models/sales.model.js");
router.get("/products_sales", async (req, res) => {
    try {
        const salesAggregation = await sales_model_js_1.Sale.aggregate([
            {
                $group: {
                    _id: "$ProductID",
                    totalQuantity: { $sum: { $toInt: "$Quantity" } },
                    totalAmount: { $sum: "$TotalAmount" },
                    salesCount: { $sum: 1 }
                }
            }
        ]);
        const products = await product_model_js_1.Product.find({}).lean();
        const productsWithSales = products.map(product => ({
            ...product,
            sales: salesAggregation.find(s => s._id === product.ProductID) || {
                totalQuantity: 0,
                totalAmount: 0,
                salesCount: 0
            }
        }));
        res.status(200).json(productsWithSales);
    }
    catch (e) {
        console.error("Error fetching products with sales:", e);
        res.status(500).send("Error fetching products with sales");
    }
});
//# sourceMappingURL=product.router.js.map