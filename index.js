const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

mongoose
  .connect("mongodb://localhost:27017/node-auth")
  .then(() => {
    app.listen(8000, () => {
      console.log("Server is running at port 8000");
    });
  })
  .catch((err) => {
    console.log("Connect failure !");
  });

const routes = require("./routes/routes");

app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:5000",
      "http://localhost:8000",
      "http://localhost:8081",
    ],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/", routes);
