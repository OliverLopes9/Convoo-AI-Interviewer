import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error('[db] FATAL ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connection refused')) {
      console.error(
        '[db] MongoDB is not running or not reachable. Start it locally (e.g. sudo systemctl start mongod) or set MONGODB_URI in backend/.env to a cloud URI (e.g. MongoDB Atlas).'
      );
    }
    throw err;
  }
}
