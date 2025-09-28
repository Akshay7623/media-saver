const { fbdown } = require("btch-downloader");

const facebook = (req, res) => {
  const { url } = req.body;
  fbdown(url).then((data) => {
    return res.status(200).json({...data, type:"FB", message:"success"})
  }).catch((e)=>{
    return res.status(200).json({message:"Some server error",type:"FB"})
  })
};

module.exports = { facebook };
