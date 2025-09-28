const { Token } = require("./db/Token.js");
const { dbConnect } = require("./db/db.connect.js");

const isTokenUsed = async (token) => {
  try {
    const result = await Token.findOne({ token });
    return result;
  } catch (error) {
    return null;
  }
};

const checkToken = async (token) => {
  try {
    await dbConnect();
    return await isTokenUsed(token);
  } catch (error) {
    return false;
  }
};

const saveToken = async (token) => {
  try {
    await dbConnect();
    const newToken = new Token({ token });
    await newToken.save();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { checkToken, saveToken };
