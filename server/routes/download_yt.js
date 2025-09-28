const cheerio = require("cheerio");
const express = require("express");
const router = express.Router();

const getVideoURL = async (videoURL) => {
  try {
    const res = await fetch("https://ssyoutube.online/yt-video-detail/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        priority: "u=0, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "upgrade-insecure-requests": "1",
        cookie:
          "pll_language=en; _ga=GA1.1.615031174.1734944936; _clck=1h5qc37%7C2%7Cfrz%7C0%7C1818; _ga_2DJ6MW2B9R=GS1.1.1735067247.2.1.1735067298.0.0.0; _clsk=n6tpuw%7C1735067299513%7C4%7C1%7Ck.clarity.ms%2Fcollect",
        Referer: "https://ssyoutube.online/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `videoURL=${encodeURIComponent(videoURL)}`,
      method: "POST",
    });

    const data = await res.text();
    const html = cheerio.load(data);
    const button = html("span.downloadButton button");
    const onclickValue = button.attr("onclick");
    const url = onclickValue.match(/https:\/\/[^\s']+/);
    return url[0];
  } catch (e) {
    console.log("error while getting final url ", e);
    return "0";
  }
};

router.post("/", async (req, res) => {
  const url = req.body.url;

  try {
    const final_url = await getVideoURL(url);
    if (final_url !== "0") {
      return res.status(200).json({ final_url });
    } else {
      return res.status(404).json({ message: "Invalid URL" });
    }
  } catch (e) {
    console.log(e);
    return res.status(404).json({ message: "Invalid URL" });
  }
});

module.exports = router;
