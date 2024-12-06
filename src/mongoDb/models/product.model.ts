import { model, Schema,  } from "mongoose";

export interface ProductData {
    ProductID: string;
    ProductName: string;
    Category: string;
    Price: number;
}

const productSchema = new Schema<ProductData>({
    ProductID: { type: String, required: true },
    ProductName: { type: String, required: true },
    Category : { type: String, required: true },
    Price : { type: Number, required: true },
});

const Product = model<ProductData>('Product', productSchema, 'products');

export { Product };
