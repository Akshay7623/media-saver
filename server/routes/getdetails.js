const express = require("express");
const { social } = require("../social");
const { getdetails } = require("./social-platforms/youtube");
const { facebook } = require("./social-platforms/facebook");
const { instagram } = require("./social-platforms/instagram");
const { twit } = require("./social-platforms/twitter");
const router = express.Router();

router.post("/", async (req, res) => {
  const { url } = req.body;

  try {
    const url_ = new URL(url);

    if (social.youtube.includes(url_.hostname)) {
      getdetails(req, res);
    } else if (social.facebook.includes(url_.hostname)) {
      facebook(req, res);
    } else if (social.instagram.includes(url_.hostname)) {
      instagram(req, res);
    } else if (social.twitter.includes(url_.hostname)) {
      twit(req, res);
    } else {
      return res
        .status(200)
        .json({ type: "CU", message: "success", url: url_ });
    }
  } catch (e) {
    console.log(e);
    res.status(404).json({ message: "Invalid URL" });
  }
});

module.exports = router;
