"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    ProductID: { type: String, required: true },
    ProductName: { type: String, required: true },
    Category: { type: String, required: true },
    Price: { type: Number, required: true },
});
const Product = mongoose_1.default.model('Product', productSchema, 'products');
exports.Product = Product;
//# sourceMappingURL=product.model.js.map