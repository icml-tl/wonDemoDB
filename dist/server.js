"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const product_router_js_1 = require("./mongoDb/routes/product.router.js");
const sales_router_js_1 = require("./mongoDb/routes/sales.router.js");
dotenv_1.default.config();
const MongoDB_Connection_String = process.env.MONGO_URI || 'mongodb://localhost:27017/wonDb';
async function connectToMongoDB(connectionString) {
    try {
        await mongoose_1.default.connect(connectionString);
        console.log("Connected to MongoDB");
        const db = mongoose_1.default.connection;
        console.log(`Connected to database: ${db.name}`);
    }
    catch (e) {
        console.error("Error connecting to MongoDB: ", e);
    }
}
connectToMongoDB(MongoDB_Connection_String);
const PORT = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
// api routes 
app.use('/api', product_router_js_1.router);
app.use('/api', sales_router_js_1.router);
app.get('/', (req, res) => {
    res.status(200).send("Hello World of numeric");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map