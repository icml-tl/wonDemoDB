"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const salesSchema = new mongoose_1.default.Schema({
    ProductID: { type: String, required: true },
    Quantity: { type: String, required: true },
    Date: { type: Date },
    TotalAmount: { type: Number, required: true },
});
const Sale = mongoose_1.default.model('Sales', salesSchema, 'sales');
exports.Sale = Sale;
//# sourceMappingURL=sales.model.js.map