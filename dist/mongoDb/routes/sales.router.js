"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const sales_model_js_1 = require("../models/sales.model.js");
const router = require("express").Router();
exports.router = router;
router.get("/sales", async (req, res) => {
    try {
        // Get page and limit (size) from query parameters
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.size) || 100;
        // Check if limit exceeds 1000
        if (limit > 1000) {
            return res.status(400).json({
                message: "Limit cannot exceed 1000. Please adjust the limit."
            });
        }
        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;
        const data = await sales_model_js_1.Sale.find({})
            .lean()
            .skip(skip)
            .limit(limit);
        // Get the total count of documents for pagination info
        const totalCount = await sales_model_js_1.Sale.countDocuments({});
        console.log("Data retrieved:", data);
        res.status(200).json({
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            data,
        });
    }
    catch (e) {
        console.error("Error fetching sales data:", e);
        res.status(500).send("Error fetching sales data");
    }
});
//# sourceMappingURL=sales.router.js.map