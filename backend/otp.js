const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


let otpStore = {};


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "healthaxis.team@gmail.com",
    pass: "pwozxssbnuxmrnag"
  }
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP error:", error);
  } else {
    console.log("SMTP server ready");
  }
});


app.post("/send-otp", async (req, res) => {

  const { email } = req.body;

  if(!email){
    return res.json({ success:false, message:"Email required"});
  }

 
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;

  console.log("Generated OTP:", otp);

  const mailOptions = {
  from: "healthaxis.team@gmail.com",
  to: email,
  subject: "HealthAxis HMS Email Verification OTP",
  html: `
  <div style="font-family: Arial, sans-serif; padding:25px; background:#111; color:#ffffff; border-radius:10px;">
    <h2 style="color:#ffffff;"> 🏥HealthAxis Hospital Management System</h2>

    <p>Hello,</p>

    <p>Your One-Time Password (OTP) for account verification is:</p>

    <h1 style="letter-spacing:4px; color:#2c7be5;">${otp}</h1>

    <p>This OTP is valid for <b>5 minutes</b>.</p>

    <p>Please do not share this OTP with anyone.</p>

    <hr>

    <p style="font-size:12px;color:gray;">
    If you did not request this verification, please ignore this email.
    </p>

    <p>Regards,<br>
    HealthAxis Support Team</p>
  </div>
  `
};

  try {

    await transporter.sendMail(mailOptions);

    console.log("OTP sent successfully");

    res.json({ success: true });

  } catch (error) {

    console.log("Email error:", error);

    res.json({ success: false });

  }

});



app.post("/verify-otp", (req, res) => {

  const { email, otp } = req.body;

  if(otpStore[email] == otp){

    delete otpStore[email];

    res.json({ success: true });

  } else {

    res.json({ success: false });

  }

});



app.listen(5000, () => {

  console.log("Server running on port 5000");

});