# Convoo Backend

## MongoDB

The app needs a running MongoDB. Use either a **local** install or **MongoDB Atlas** (free tier).

### Option A: Local MongoDB

1. **Install** (Ubuntu/Debian):
   ```bash
   sudo apt update && sudo apt install -y mongodb
   ```
   Or use the [official install guide](https://www.mongodb.com/docs/manual/installation/) for your OS.

2. **Start** the service:
   ```bash
   sudo systemctl start mongod
   ```
   Optional: enable on boot: `sudo systemctl enable mongod`

3. Default URI is already set in `.env`: `MONGODB_URI=mongodb://localhost:27017/convoo`

### Option B: MongoDB Atlas (cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/convoo`).
3. In `backend/.env` set:
   ```env
   MONGODB_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/convoo
   ```
   Replace `your-user`, `your-password`, and `your-cluster` with your Atlas values.

## Run

- **Development:** `npm run dev` (from repo root: `npm run dev` runs both backend and frontend)
- **Production:** `npm run build` then `npm start` (run from the `backend` directory)
