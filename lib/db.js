const mongoose = require('mongoose');

const getMongoUri = () => {
  let raw = process.env.MONGODB_URI;
  if (!raw) {
    if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI environment variable is missing in Vercel Settings');
    }
    return 'mongodb://127.0.0.1:27017/resumespark';
  }
  raw = raw.trim().replace(/^["']|["']$/g, '');
  const match = raw.match(/mongodb(?:\+srv)?:\/\/[^\s"']+/);
  if (match) {
    return match[0];
  }
  return raw;
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = getMongoUri();

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB database successfully.');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
