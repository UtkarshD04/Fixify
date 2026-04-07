const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const utilityModel = require("./models/utility.model");
const bookingModel = require("./models/bookings.model");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// expose io globally for controllers
global.io = io;

const connectedProviders = {};
const connectedUsers = {};

io.on("connection", (socket) => {

  socket.on("registerProvider", async (providerId) => {
    connectedProviders[providerId] = socket.id;
    try {
      await utilityModel.findByIdAndUpdate(providerId, {
        socketId: socket.id,
        status: "active",
      });
    } catch (err) {
      console.error("Error updating provider socket:", err.message);
    }
  });

  socket.on("registerUser", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on("disconnect", async () => {
    const providerId = Object.keys(connectedProviders).find(
      (key) => connectedProviders[key] === socket.id
    );
    if (providerId) {
      delete connectedProviders[providerId];
      try {
        await utilityModel.findByIdAndUpdate(providerId, {
          socketId: null,
        });
      } catch (err) {
        console.error("Error updating provider on disconnect:", err.message);
      }
    }

    const userId = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key] === socket.id
    );
    if (userId) {
      delete connectedUsers[userId];
    }
  });
});

// Book service route
app.post("/book-service", async (req, res) => {
  try {
    const { userId, category, details } = req.body;

    const provider = await utilityModel.findOne({
      profession: category,
      status: "active",
    });

    if (!provider) {
      return res.status(404).json({ message: "No active provider available" });
    }

    const booking = new bookingModel({
      userId,
      providerId: provider._id,
      category,
      details,
      status: "pending",
    });
    await booking.save();

    if (connectedProviders[provider._id]) {
      io.to(connectedProviders[provider._id]).emit("newBooking", booking);
    }

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept/Reject booking route
app.post("/booking/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const booking = await bookingModel.findById(id).populate("userId providerId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (action === "accept") {
      booking.status = "confirmed";
    } else if (action === "reject") {
      booking.status = "rejected";
    } else if (action === "complete") {
      booking.status = "completed";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await booking.save();

    if (connectedUsers[booking.userId._id]) {
      io.to(connectedUsers[booking.userId._id]).emit("bookingUpdate", {
        bookingId: booking._id,
        status: booking.status,
      });
    }

    res.json({ message: `Booking ${booking.status}`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get provider bookings route
app.get("/provider/:id/bookings", async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await bookingModel
      .find({ providerId: id })
      .populate("userId", "fullname email")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
