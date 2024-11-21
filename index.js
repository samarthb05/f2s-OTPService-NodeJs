const express = require("express");
const axios = require("axios");
require("dotenv").config();

const port = 5000;
const app = express();
app.use(express.json());

const otpsave = {};

//send otp
app.post("/sendOTP", async (req, res) => {
  try {
    const mobileNumber = req.body.mobileNumber;
    const otp = Math.floor(1000 + Math.random() * 9000); //4 digit otp
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        variables_values: `OTP is ${otp}`,
        route: "otp",
        numbers: mobileNumber,
      },
    });
    return res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//verify otp
app.post("/verifyOtp", async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Mobile number and otp require for verfication!" });
    }
    if (otpsave.hasOwnProperty(mobileNumber)) {
      const { saveOtp, expirationTime } = otpsave[mobileNumber];

      if (saveOtp === otp && Date.now() < expirationTime) {
        return res.status(200).json({ message: "OTP verfied successfully!" });
      } else {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Mobile number not found or OTP expired!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`server listen to ${port}`);
});
