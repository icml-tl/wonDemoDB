import mongoose from "mongoose";


const salesSchema = new mongoose.Schema({
    ProductID: { type: String, required: true },
    Quantity : { type: String, required: true },
    Date : { type: Date },
    TotalAmount : { type: Number, required: true },

});

const Sale = mongoose.model('Sales', salesSchema, 'sales');  


export { Sale };