require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const getVideoDetails = require("./routes/getdetails.js");
const downloadVideo = require("./routes/download_yt.js");
const contactUS = require("./routes/contact.js");

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: "*",
  methods: "GET,POST",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/get_details", getVideoDetails);
app.use("/api/download_video/yt", downloadVideo);
app.use("/api/contact_us", contactUS);

app.use(express.static(__dirname + "/dist"));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});