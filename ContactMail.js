// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const twilio = require("twilio");
// require("dotenv").config(); // Use .env for security

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(bodyParser.json());
// app.use(cors());

// let otpStore = {}; // Store OTPs temporarily
// // const accountSid = "ACb93aa441cd1479351f2bb79c9d2249ab"; // Store these in .env
// // const authToken = "c309afe5ed872fb273885285e3337e23";
// //const client = require('twilio')(accountSid, authToken);
// const accountSid = "ACb93aa441cd1479351f2bb79c9d2249ab"; // Store these in .env
// const authToken = "c309afe5ed872fb273885285e3337e23";
// // const client = require('twilio')(accountSid, authToken);
// // Twilio credentials (store securely in .env)
// const twilioClient = twilio(accountSid,authToken);
// //const TWILIO_PHONE = '+19064226997' // Twilio phone number

// // Nodemailer transporter for email OTP
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: 'ihtark5@gmail.com', // Your Gmail
//     pass: 'tthr usdb xnzq qbgc', // App Password (not Gmail password)
//   },
// });

// // Generate 4-digit OTP
// const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

// // **Send OTP via Email**
// app.post("/send-email", async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ success: false, message: "Email is required" });

//   const otp = generateOTP();
//   otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
//   console.log(`Stored OTP for ${email}:`, otpStore[email]); // ✅ Debugging log

//   const mailOptions = {
//     from: 'ihtark5@gmail.com',
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP is ${otp}. It expires in 5 minutes.`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to send OTP" });
//   }
// });

// // **Send OTP via Phone (Twilio)**
// app.post("/send-otp", async (req, res) => {
//   const { phone } = req.body;
//   if (!phone.startsWith("+") || phone.length < 10)
//     return res.status(400).json({ success: false, message: "Invalid phone number format" });

//   const otp = generateOTP();
//   otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

//   try {
//     await twilioClient.messages.create({
//       body: `Your OTP is ${otp}. It expires in 5 minutes.`,
//       from: '+19064226997',
//       to: phone,
//     });

//     console.log(`OTP Sent: ${otp} to ${phone}, Message SID: ${message.sid}`);

//     res.status(200).json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to send OTP" });
//   }
// });

// // **Verify OTP**
// app.post("/verify-otp", (req, res) => {
//   let { contact, otp } = req.body;
//   contact = contact.trim().toLowerCase(); // ✅ Trim spaces



//   console.log(`Received OTP for verification: ${otp} from ${contact}`);
//   console.log(`Stored OTP keys:`, Object.keys(otpStore)); // ✅ Debugging log

//   if (!contact || !otp) return res.status(400).json({ success: false, message: "Contact and OTP are required" });

//   let storedOtp = otpStore[contact];
//   console.log(`Stored OTP:`, storedOtp); // Debugging line

//   if (!storedOtp || Date.now() > storedOtp.expiresAt)
//     return res.status(400).json({ success: false, message: "OTP expired or not found" });

//   if (otp.toString() === storedOtp.otp.toString()) {
//     console.log(`Deleting OTP for ${contact}`);

//     delete otpStore[contact];
//     res.status(200).json({ success: true, message: "OTP verified successfully" });
//   } else {
//     res.status(400).json({ success: false, message: "Invalid OTP" });
//   }
// });

// // **Start server**
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Twilio Credentials
const accountSid = "ACb93aa441cd1479351f2bb79c9d2249ab";
const authToken = "c309afe5ed872fb273885285e3337e23";
const twilioClient = twilio(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);

// OTP Store
const otpStore = {};

// Function to generate 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000);

// **Send OTP**
app.post('/send-otp', async (req, res) => {
    const { contact } = req.body;

    if (!contact) {
        return res.status(400).json({ success: false, message: "Enter a valid email or phone number" });
    }
    if (otpStore[contact] && Date.now() < otpStore[contact].nextResend) {
        return res.status(400).json({ success: false, message: "Wait before resending OTP" });
    }

    const otp = generateOtp();
    otpStore[contact] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    if (contact.includes('@')) {
        // Send OTP via Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ihtark5@gmail.com',
                pass: 'tthr usdb xnzq qbgc',
            }
        });

        const mailOptions = {
            from: 'ihtark5@gmail.com',
            to: contact,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: "Failed to send OTP" });
            }
            res.status(200).json({ success: true, message: "OTP sent successfully" });
        });
    } else {
        // Send OTP via SMS
        try {
            await twilioClient.messages.create({
                body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
                from: '+19064226997',
                to: contact
            });
            res.status(200).json({ success: true, message: "OTP sent successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to send OTP" });
        }
    }
});

// **Verify OTP**
// app.post('/verify-otp', (req, res) => {
//     const { contact, otp } = req.body;

//     if (!otpStore[contact] || otpStore[contact].otp.toString() !== otp.toString()) {
//         return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     delete otpStore[contact];
//     res.status(200).json({ success: true, verified: true, message: "OTP verified" });
// });

app.post('/verify-otp', (req, res) => {
    const { contact, otp } = req.body;
    
    if (!otpStore[contact]) {
        return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }

    const { otp: storedOtp, expiresAt } = otpStore[contact];

    if (Date.now() > expiresAt) {
        delete otpStore[contact]; // Delete expired OTP
        return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (storedOtp.toString() !== otp.toString()) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    delete otpStore[contact]; // OTP is valid, remove it
    res.status(200).json({ success: true, verified: true, message: "OTP verified" });
});


app.listen(3500, () => console.log("Server running on port 3500"));
