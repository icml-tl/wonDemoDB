"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const router = require("express").Router();
exports.router = router;
const product_model_js_1 = require("../models/product.model.js");
router.get("/products", async (req, res) => {
    try {
        const data = await product_model_js_1.Product.find({}).lean();
        console.log("Data retrieved:", data);
        res.status(200).json(data);
    }
    catch (e) {
        console.error("Error fetching products:", e);
        res.status(500).send("Error fetching products");
    }
});
//# sourceMappingURL=product.router.js.map