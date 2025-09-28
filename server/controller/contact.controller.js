const nodemailer = require("nodemailer");
const google_app_key = process.env.GOOGLE_APP_PASSWORD;
const mail = process.env.CONTACT_MAIL;
const username = process.env.SMTP_USERNAME;

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: username,
    pass: google_app_key,
  },
});

const send = async (text) => {
  await transporter.sendMail({from: mail,to: mail,subject: "Someone contacted",text: "",html: text,});
}

const sendMail = async (req, res) => {
  const { name, email, desc } = req.body;
  const newDesc = desc.slice(0,500);

  const text = `
  Sender Name : ${name} 
  <br/>
  Sender email: ${email}
  <br/>
  Description : ${newDesc}`;
  send(text);
  
  return res.status(200).json({ message: "sent", success: true });
};

module.exports = { sendMail };
