const { twitter } = require("btch-downloader");

const twit = (req, res) => {
    const { url } = req.body;
    twitter(url).then((data) => {
      return res.status(200).json({data:data, type:"TW", message:"success"})
    }).catch((e)=>{
      return res.status(200).json({message:"Some server error",type:"FB"})
    })

};

module.exports = { twit };
