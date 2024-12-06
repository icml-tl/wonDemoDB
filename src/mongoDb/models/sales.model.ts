import { model, Schema } from "mongoose";

export interface SaleData {
    ProductID: string;
    Quantity: number;
    Date: Date;
    TotalAmount: number;
}



const salesSchema = new Schema<SaleData>({
    ProductID: { type: String, required: true },
    Quantity : { type: Number, required: true },
    Date : {  type: Date, required: true },
    TotalAmount : { type: Number ,  required: true },

});


const Sale = model<SaleData>('Sales', salesSchema, 'sales');  



export { Sale };