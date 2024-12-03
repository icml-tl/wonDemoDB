"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const salesFile = 'src/assets/sales.csv';
const productsFile = 'src/assets/products.csv';
const salesData = [];
const productsData = new Set();
// Read and parse products CSV
fs_1.default.createReadStream(productsFile)
    .pipe((0, csv_parser_1.default)())
    .on('data', (row) => {
    productsData.add(row.ProductID);
})
    .on('end', () => {
    console.log('Products CSV file successfully processed');
    // Read and parse sales CSV
    fs_1.default.createReadStream(salesFile)
        .pipe((0, csv_parser_1.default)())
        .on('data', (row) => {
        salesData.push(row.ProductID);
    })
        .on('end', () => {
        console.log('Sales CSV file successfully processed');
        // Identify missing ProductIDs
        const missingProductIDs = salesData.filter(id => !productsData.has(id));
        // Get unique missing ProductIDs
        const uniqueMissingProductIDs = [...new Set(missingProductIDs)];
        console.log('Missing ProductIDs:', uniqueMissingProductIDs);
    });
});
//# sourceMappingURL=verifyCsvData.js.map