const express = require("express");
const axios = require("axios");
const router = express.Router();
const contactController = require("../controller/contact.controller.js");
const { checkToken, saveToken } = require("./checkToken.js");
const cloudflare_secret = process.env.CLOUDFLARE_SECRET_KEY;
const cloudflare_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstileToken(token, secretKey) {
  try {
    const payload = new URLSearchParams();
    payload.append("secret", secretKey);
    payload.append("response", token);

    const response = await axios.post(cloudflare_url, payload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.data.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

router.post("/",
  async (req, res, next) => {
    const { name, email, desc, token } = req.body;

    if ([name, email, desc, token].some((e) => e === undefined) ||[name, email, desc, token].some((e) => e === null) || !isValidEmail(email)) {
      return res.status(400).json({ message: "bad request", success: false });
    }

    try {
      const check = await checkToken(token);

      if (check) {
        return res.status(200).json({ message: "failed", success: false });
      } else {
        await saveToken(token);
        const token_check = await verifyTurnstileToken(token,cloudflare_secret);

        if (token_check) {
          next();
        } else {
          return res.status(200).json({ message: "failed", success: false });
        }
      }
    } catch (_) {
      return res.status(200).json({ message: "failed", success: false });
    }
  },
  contactController.sendMail
);

module.exports = router;
