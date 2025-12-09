const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);


app.use((req, res, next) => {
  res.status(404);

  if (req.originalUrl.startsWith("/api")) {
    return res.json({ success: false, message: "Route not found" });
  }
  return res.render("404", { message: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || 500;

  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }

  res.status(statusCode).render("error", {
    message: err.message || "Something went wrong",
  });
});

module.exports = app;
