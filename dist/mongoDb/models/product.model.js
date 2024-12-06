"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    ProductID: { type: String, required: true },
    ProductName: { type: String, required: true },
    Category: { type: String, required: true },
    Price: { type: Number, required: true },
});
const Product = (0, mongoose_1.model)('Product', productSchema, 'products');
exports.Product = Product;
//# sourceMappingURL=product.model.js.map