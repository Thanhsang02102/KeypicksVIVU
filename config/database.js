const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use MONGODB_URI from environment, fallback to Docker service name
        // Never use localhost - always use Docker container name for development
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin';
        
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        console.log(`Server Timezone: ${process.env.TZ || 'System default'}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;