 const  mongoose = require('mongoose');


 function connectToDb() {
     const uri = process.env.MONGODB_URI || process.env.DB_CONNECT;
     if (!uri) {
        console.error('❌ No MongoDB URI found in environment variables');
        process.exit(1);
     }
     mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true
     })
     .then(() => {
        const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');
        const dbName = uri.split('/').pop().split('?')[0];
        console.log(`✅ Connected to ${isAtlas ? 'MongoDB Atlas' : 'MongoDB Local'} - DB: ${dbName}`);
     }).catch((err) => {
        console.log('❌ Database connection failed:', err.message);
     });
 }
 module.exports = connectToDb;