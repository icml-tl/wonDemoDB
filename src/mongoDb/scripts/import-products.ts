import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import { Product } from '../models/product.model.js'; 
import { Sale } from '../models/sales.model.js';
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

const BATCH_SIZE = 1000; //batch size as needed

const importData = async (filePath: string, type: 'products' | 'sales'): Promise<void> => {
    try {
        let totalSalesInserted = 0; // Counter for total sales inserted

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

                    // If the batch size is reached, insert the batch
                    if (products.length === BATCH_SIZE) {
                        Product.insertMany(products)
                            .then(() => {
                                totalSalesInserted += products.length; // Update the counter
                                console.log(`Inserted ${BATCH_SIZE} products.`);
                                products.length = 0; // Clear the array
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

                    // If the batch size is reached, insert the batch
                    if (sales.length === BATCH_SIZE) {
                        Sale.insertMany(sales)
                            .then(() => {
                                totalSalesInserted += sales.length;
                                console.log(`Inserted ${BATCH_SIZE} sales.`);
                                sales.length = 0; // Clear the array
                            })
                            .catch(err => console.error("Error inserting batch of sales:", err));
                    }
                })
                .on("end", async () => {
                    // Insert any remaining sales
                    if (sales.length > 0) {
                        await Sale.insertMany(sales);
                        totalSalesInserted += sales.length; // Update the counter
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

// Update the CSV file path based on your actual file location and type
importData("src/assets/products.csv", 'products'); // For product import
//importData("src/assets/sales.csv", 'sales'); // Uncomment for sales import