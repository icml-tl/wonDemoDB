import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import { Product } from '../mongoDb/models/product.model.js'; 
import { Sale } from '../mongoDb/models/sales.model.js';
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MongoDB URI is missing. Add MONGO_URI to your .env file.");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

interface ProductData {
    ProductID: string;
    ProductName: string;
    Category: string;
    Price: number;
}

interface SaleData {
    SaleID: string;
    ProductID: string;
    Quantity: number;
    Date: string;
    TotalAmount: number;
}

const BATCH_SIZE = 1000; 

const importData = async (filePath: string, type: 'products' | 'sales'): Promise<void> => {
    try {
        let totalSalesInserted = 0; 

        if (type === 'products') {
            const products: ProductData[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row) => {
                    products.push({
                        ProductID: row.ProductID,
                        ProductName: row.ProductName,
                        Category: row.Category,
                        Price: parseFloat(row.Price),
                    });
                    if (products.length === BATCH_SIZE) {
                        Product.insertMany(products)
                            .then(() => {
                                totalSalesInserted += products.length; 
                                console.log(`Inserted ${BATCH_SIZE} products.`);
                                products.length = 0; 
                            })
                            .catch(err => console.error("Error inserting batch of products:", err));
                    }
                })
                .on("end", async () => {
                    if (products.length > 0) {
                        await Product.insertMany(products);
                        totalSalesInserted += products.length;
                        console.log(`Inserted remaining ${products.length} products.`);
                    }
                    console.log("Product CSV file successfully processed.");
                    mongoose.connection.close();
                });
        } else if (type === 'sales') {
            const sales: SaleData[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row) => {
                    sales.push({
                        SaleID: row.SaleID,
                        ProductID: row.ProductID,
                        Quantity: parseInt(row.Quantity, 10),
                        Date: row.Date,
                        TotalAmount: parseFloat(row.TotalAmount),
                    });
                    if (sales.length === BATCH_SIZE) {
                        Sale.insertMany(sales)
                            .then(() => {
                                totalSalesInserted += sales.length;
                                console.log(`Inserted ${BATCH_SIZE} sales.`);
                                sales.length = 0;
                            })
                            .catch(err => console.error("Error inserting batch of sales:", err));
                    }
                })
                .on("end", async () => {
                    if (sales.length > 0) {
                        await Sale.insertMany(sales);
                        totalSalesInserted += sales.length;
                        console.log(`Inserted remaining ${sales.length} sales.`);
                    }
                    console.log(`Total sales inserted: ${totalSalesInserted}`);
                    console.log("Sales CSV file successfully processed.");
                    mongoose.connection.close();
                });
        }
    } catch (error) {
        console.error("Error inserting data:", error);
        mongoose.connection.close();
    }
};


// run node dist/scripts/import-data.js to insert products data 
importData("src/assets/products.csv", 'products'); 

// Uncomment to import sales data and run npm run build then run this commande   node dist/scripts/import-data.js
//importData("src/assets/sales.csv", 'sales'); 