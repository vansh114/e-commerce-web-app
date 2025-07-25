require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

const connectToMongo = async () => {
    if (!mongoURI) {
        console.error("❌ MongoDB Connection URI not found in environment variables");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB Successfully");
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

module.exports = connectToMongo;