// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// const PORT = 5000;
// const MONGO_URI = "mongodb://mongodb+srv://avishved82_db_user:IAB8Gh9LpuYJoWHA@aquatrack.a7scbgc.mongodb.net/?retryWrites=true&w=majority&appName=Aquatrack.0.0.1:27017/waterUsage";

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Schema
// const usageSchema = new mongoose.Schema({
//   room: { type: String, required: true },
//   totalUsage: { type: Number, default: 0 },
//   dailyUsage: {
//     date: String,
//     usage: { type: Number, default: 0 }
//   },
//   lastUpdated: { type: Date, default: Date.now }
// });

// const Usage = mongoose.model("Usage", usageSchema);

// // POST route to match Arduino data
// app.post("/usage", async (req, res) => {
//   try {
//     const { room, date, dailyUsage, totalLitres } = req.body;

//     if (!room || typeof dailyUsage !== "number" || typeof totalLitres !== "number") {
//       return res.status(400).json({ error: "Invalid data" });
//     }

//     let record = await Usage.findOne({ room });

//     if (!record) {
//       // Create new record
//       record = new Usage({
//         room,
//         totalUsage: totalLitres,
//         dailyUsage: { date, usage: dailyUsage }
//       });
//     } else {
//       // Reset daily usage if date changes
//       if (record.dailyUsage.date !== date) {
//         record.dailyUsage.date = date;
//         record.dailyUsage.usage = 0;
//       }

//       // Update usage
//       record.totalUsage = totalLitres;
//       record.dailyUsage.usage = dailyUsage;
//     }

//     record.lastUpdated = new Date();
//     await record.save();

//     res.json({ message: "Usage updated", record });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // GET usage by room
// // Get all rooms' usage data
// app.get("/usage", async (req, res) => {
//   try {
//     // Fetch all room records
//     const records = await Usage.find();

//     if (!records || records.length === 0) {
//       return res.status(404).json({ error: "No usage data found" });
//     }

//     // Format response (you can keep raw records too if you want)
//     const formatted = records.map(record => ({
//       room: record.room,
//       totalUsage: record.totalUsage,
//       dailyUsage: record.dailyUsage,
//       lastUpdated: record.lastUpdated,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("Connected to MongoDB");
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((err) => console.error("MongoDB connection error:", err));
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Corrected MongoDB URI
const MONGO_URI = "mongodb+srv://avishved27:duAMLibJVhRJammA@cluster0.wklkfu5.mongodb.net/";

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

// POST route (ESP32 sends data here)
app.post("/usage", async (req, res) => {
  try {
    const { room, date, dailyUsage, totalLitres } = req.body;

    if (!room || typeof dailyUsage !== "number" || typeof totalLitres !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }

    let record = await Usage.findOne({ room });

    if (!record) {
      record = new Usage({
        room,
        totalUsage: totalLitres,
        dailyUsage: { date, usage: dailyUsage }
      });
    } else {
      if (record.dailyUsage.date !== date) {
        record.dailyUsage.date = date;
        record.dailyUsage.usage = 0;
      }

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

// GET all usage data
app.get("/usage", async (req, res) => {
  try {
    const records = await Usage.find();

    if (!records || records.length === 0) {
      return res.status(404).json({ error: "No usage data found" });
    }

    const formatted = records.map(record => ({
      room: record.room,
      totalUsage: record.totalUsage,
      dailyUsage: record.dailyUsage,
      lastUpdated: record.lastUpdated,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DB connection + Start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
