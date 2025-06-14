const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcyrypt = require('bcryptjs');

// const app = express();
const router = express.Router()
const port = process.env.PORT || 3500;

// MongoDB connection
// mongoose.connect('mongodb://127.0.0.1:27017/userLoginDetails');
// mongoose.connect('mongodb://localhost:27017/auth_demo');

//USER LOGIN DETAILS ARE STORED IN THIS COLLECTION / DATBASE
const UserSchema = new mongoose.Schema(
    {
        userName:{ type:String, required:true},
        userEmail:{ type:String, required:true, unique:true },
        userPhone:{ type:String, required:true },
        createdAt:{ type:Date, default:Date.now}
    }
);
const User = mongoose.model("User", UserSchema)

router.use(bodyParser.json());
router.use(cors());


const otpStore = {}; // Store OTPs temporarily
// Root endpoint
router.get('/', (req, res) => {
    res.send('Welcome to Email OTP Verification API');
});

// Check if user exists
router.post('/check-user', async (req, res) => {
  const { email,phone } = req.body;
  try {
    // const user = await User.findOne({ UserEmail:email });
    // res.json({ exists: !!user });
     let user;
        if (email) {
            user = await User.findOne({ userEmail: email });
        } else if (phone) {
            user = await User.findOne({ userPhone: phone });
        } else {
            return res.status(400).json({ error: 'Email or phone is required' });
        }
        
        res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



// Add this new endpoint to your backend
router.post('/check-user-exists', async (req, res) => {
    const { email, phone } = req.body;
    
    try {
        const emailExists = email ? await User.findOne({ userEmail: email }) : false;
        const phoneExists = phone ? await User.findOne({ userPhone: phone }) : false;
        
        res.json({
            emailExists: !!emailExists,
            phoneExists: !!phoneExists
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new user
router.post('/create-user', async (req, res) => {
    const { userName, userEmail, userPhone } = req.body;
    
    try {
        // Check if user already exists

 // Validate all required fields
        if (!userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: 'All fields are required' });
        }


        // if (userEmail) {
        const existingEmail = await User.findOne({ userEmail });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already registered',
                                suggestion: 'Try logging in or use a different email'

             });
        }
    // }
    // Check if phone already exists
        // if (userPhone) {
        const existingPhone = await User.findOne({ userPhone });
        if (existingPhone) {
            return res.status(400).json({ error: 'Phone number already registered',
                                suggestion: 'Try logging in or use a different phone number'

             });
        }
    // }
        // Create new user
        const newUser = new User({ 
            userName, 
            userEmail, 
            userPhone 
        });
        
        await newUser.save();
        
        res.json({ 
            success: true, 
            user: {
                userName: newUser.userName,
                userEmail: newUser.userEmail,
                userPhone: newUser.userPhone
            }
        });
    } catch (err) {
                console.error(err); 
        res.status(500).json({ error: 'Server error' });
    }
});

// Send OTP (works for both email and phone)
router.post('/send-otp', async (req, res) => {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Email or phone is required" });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpKey = email || phone;

    otpStore[otpKey] = { 
        otp, 
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
    };

    if (email) {
        // Send email OTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'ihtark5@gmail.com',
            to: email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is: ${otp}\nValid for 5 minutes.`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Failed to send OTP" });
            }
            res.json({ success: true, message: "OTP sent to email" });
        });
    } else if (phone) {
        // In a real router, integrate with SMS service like Twilio here
        console.log(`OTP for ${phone}: ${otp}`); // For development only
        res.json({ success: true, message: "OTP sent to phone" });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, phone, otp } = req.body;
    const otpKey = email || phone;

    if (!otpKey || !otp) {
        return res.status(400).json({ success: false, message: "Email/phone and OTP required" });
    }

    const storedData = otpStore[otpKey];
    
    if (!storedData || Date.now() > storedData.expiresAt) {
        return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }

    if (otp.toString() !== storedData.otp.toString()) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    delete otpStore[otpKey]; // Clear OTP after verification
 try {
        // Check if user exists
 
    
    let user;
    if (email) {
        user = await User.findOne({ userEmail: email });
    } else if (phone) {
        user = await User.findOne({ userPhone: phone });
    }

    res.json({ 
        success: true, 
        verified: true,
        userExists: !!user,
        user: user || null
    });

    console.log(`Stored OTP: ${storedData.otp}, Received OTP: ${otp}`);
 }
  catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }

});


// At the end of LoginMain.js and VerifyMain.js
module.exports = router;

// // **Start the server**
// router.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
