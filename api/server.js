import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";
dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}..`);
});

app.use('/api/user', userRoutes);