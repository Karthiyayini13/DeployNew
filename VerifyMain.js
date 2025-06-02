const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load API keys securely

const accountSid = "ACb93aa441cd1479351f2bb79c9d2249ab"; // Store these in .env
const authToken = "c309afe5ed872fb273885285e3337e23";
const client = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);
// const app = express();
const router = express.Router()
router.use(bodyParser.json());
router.use(cors());

const otpStore = {}; // Store OTPs temporarily

// **Send OTP**
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone || !phone.startsWith('+')) {
        return res.status(400).json({ success: false, message: "Enter a valid phone number in E.164 format" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 mins

    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
          //  messagingServiceSid: "MGfdd70b29590d5e1edc19f4cd9fe2e9f4", // ✅ Use Messaging Service SID
          from : '+19064226997', 
          to: phone
        });

        console.log(`OTP Sent: ${otp} to ${phone}, Message SID: ${message.sid}`);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Twilio Error:", error);

        if (error.code === 21608) {
            res.status(400).json({ success: false, message: "Upgrade Twilio account to send to unverified numbers." });
        } else {
            res.status(500).json({ success: false, message: "Failed to send OTP. Check Twilio logs." });
        }
    }
});

// **Verify OTP**
router.post('/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const storedData = otpStore[phone];
    if (!storedData || Date.now() > storedData.expiresAt) {
        return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (otp.toString() === storedData.otp.toString()) {
        delete otpStore[phone]; // Remove OTP after verification
        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// At the end of LoginMain.js and VerifyMain.js
module.exports = router;

// // **Start Server**
// const PORT = 4003;
// router.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

