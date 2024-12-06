"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const sales_model_js_1 = require("../models/sales.model.js");
const router = require("express").Router();
exports.router = router;
router.get("/sales", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.size) || 100;
        if (limit > 1000) {
            return res.status(400).json({
                message: "Limit cannot exceed 1000. Please adjust the limit.",
            });
        }
        if (!req.query.page && !req.query.size) {
            // if no pagination return total pages only
            const totalSalesCount = await sales_model_js_1.Sale.countDocuments();
            res.status(200).json({ totalSalesCount });
            return;
        }
        else {
            const skip = (page - 1) * limit;
            const data = await sales_model_js_1.Sale.find({}).lean().skip(skip).limit(limit);
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
    }
    catch (e) {
        console.error("Error fetching sales data:", e);
        res.status(500).send("Error fetching sales data");
    }
});
//# sourceMappingURL=sales.router.js.map