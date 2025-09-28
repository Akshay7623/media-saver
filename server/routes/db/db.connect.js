const mongoose = require("mongoose");
const mongo_string = process.env.MONGO_URI;

const dbConnect = async () => {
  await mongoose.connect(mongo_string, { useNewUrlParser: true });
};

module.exports = { dbConnect };
