"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const mongoose_1 = require("mongoose");
const salesSchema = new mongoose_1.Schema({
    ProductID: { type: String, required: true },
    Quantity: { type: Number, required: true },
    Date: { type: Date, required: true },
    TotalAmount: { type: Number, required: true },
});
const Sale = (0, mongoose_1.model)('Sales', salesSchema, 'sales');
exports.Sale = Sale;
//# sourceMappingURL=sales.model.js.map