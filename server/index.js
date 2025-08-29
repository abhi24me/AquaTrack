const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/waterUsage";

// Middleware
app.use(cors());
app.use(express.json());

// Schema
const usageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  totalUsage: { type: Number, default: 0 },
  dailyUsage: {
    date: String,
    usage: { type: Number, default: 0 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

const Usage = mongoose.model("Usage", usageSchema);

// POST route to match Arduino data
app.post("/usage", async (req, res) => {
  try {
    const { room, date, dailyUsage, totalLitres } = req.body;

    if (!room || typeof dailyUsage !== "number" || typeof totalLitres !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }

    let record = await Usage.findOne({ room });

    if (!record) {
      // Create new record
      record = new Usage({
        room,
        totalUsage: totalLitres,
        dailyUsage: { date, usage: dailyUsage }
      });
    } else {
      // Reset daily usage if date changes
      if (record.dailyUsage.date !== date) {
        record.dailyUsage.date = date;
        record.dailyUsage.usage = 0;
      }

      // Update usage
      record.totalUsage = totalLitres;
      record.dailyUsage.usage = dailyUsage;
    }

    record.lastUpdated = new Date();
    await record.save();

    res.json({ message: "Usage updated", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET usage by room
app.get("/usage/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const record = await Usage.findOne({ room });
    if (!record) return res.status(404).json({ error: "Room not found" });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
