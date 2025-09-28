const axios = require("axios");

const getdetails = (req, res) => {
  const { url } = req.body;

  axios.get(url).then((resp) => {

    const match = resp.data.match(/ytInitialPlayerResponse = ({.*?});/s);

    if (match) {
      const ytData = JSON.parse(match[1]);
      const seconds = ytData.videoDetails.lengthSeconds;
      const durationString = `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`;
      const title = ytData.videoDetails.title;
      const imageUrl = ytData.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      const s = new Set();

      for (let i = 0; i < ytData.streamingData.adaptiveFormats.length; i++) {
        s.add(ytData.streamingData.adaptiveFormats[i].qualityLabel);
      }

      s.delete(undefined);

      return res.status(200).json({ img: imageUrl, type: "YT", duration: durationString, title: title, formats: [360] });
    } else {
      return res.status(404).json({message:"No record found", status: 'exception'}); 
    }
  }).catch((e) => {
    console.log("Error", e);
    res.status(404).json({ message: "Invalid parameters", status: 'exception' });
  });
};

module.exports = { getdetails };
