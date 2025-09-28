const { igdl } = require("btch-downloader");



const instagram = (req, res) => {
  const { url } = req.body;
  igdl(url).then((data) => {
    return res.status(200).json({url:data[0], type:"IN", message:"success"})
  }).catch((e)=>{
    return res.status(200).json({message:"Some server error",type:"FB"})
  })
};

module.exports = { instagram };
