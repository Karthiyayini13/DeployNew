// const express = require('express');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const bcyrypt = require('bcryptjs');

// const app = express();
// const port = process.env.PORT || 3500;

// // MongoDB connection
// mongoose.connect('mongodb://127.0.0.1:27017/userLoginDetails');
// // mongoose.connect('mongodb://localhost:27017/auth_demo');

// //USER LOGIN DETAILS ARE STORED IN THIS COLLECTION / DATBASE
// const UserSchema = new mongoose.Schema(
//     {
//         userName:{ type:String, required:true},
//         userEmail:{ type:String, required:true, unique:true },
//         userPhone:{ type:String, required:true },
//         createdAt:{ type:Date, default:Date.now}
//     }
// );
// const User = mongoose.model("UserDetails", UserSchema)

// app.use(bodyParser.json());
// app.use(cors());


// const otpStore = {}; // Store OTPs temporarily

// // Root endpoint
// app.get('/', (req, res) => {
//     res.send('Welcome to Email OTP Verification API');
// });

// // Check if user exists
// app.post('/check-user', async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ UserEmail:email });
//     res.json({ exists: !!user });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create new user
// app.post('/create-user', async (req, res) => {
//   const { userName, userEmail, userPhone } = req.body;
  
//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({UserEmail: userEmail });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Create new user
//     const newUser = new User({ 
        
//  UserName: userName,
//       UserEmail: userEmail,
//       UserPhone: userPhone

//     });
//     await newUser.save();
    
//     res.json({ success: true, user: newUser });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // **Send Email OTP**
// app.post('/send-email', async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     // Generate 4-digit OTP
//   //  const otp = Math.floor(100000 + Math.random() * 900000); //6 digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000);  //4 digit OTP

//     otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

//     // Configure email transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'ihtark5@gmail.com',
//             pass: 'tthr usdb xnzq qbgc' // Use App Password (Not your actual Gmail password)
//         }
//     });


//     // Email content
//     const mailOptions = {
//         from: 'ihtark5@gmail.com',
//         to: email,
//         subject: 'Your OTP for Email Verification',
//         text: `Hello,\n\nYour OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nBest regards,\n Adinn Outdoors`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).json({ success: false, message: "Failed to send OTP email" });
//         }
//         console.log(`Email sent: ${info.response}`);
//         res.status(200).json({ success: true, message: "OTP sent successfully" });
//     });
// });

// // **Verify Email OTP**
// app.post('/verify-email-otp',async (req, res) => {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//         return res.status(400).json({ success: false, message: "Email and OTP are required" });
//     }

//     const storedData = otpStore[email];
//     if (!storedData || Date.now() > storedData.expiresAt) {
//         return res.status(400).json({ success: false, message: "OTP expired or not found" });
//     }
//     console.log("Stored OTP:", storedData.otp, "Received OTP:", otp); // Debugging log
//     if (otp.toString() === storedData.otp.toString()) 
//       {
//         delete otpStore[email]; // Remove OTP after successful verification
//  // Check if user exists in database
//         const user = await UserDetails.findOne({ email });

//         return res.status(200).json({ success: true, verified: true,            userExists: !!user,
//  message: "OTP verified successfully" });
//     } else {
//         return res.status(400).json({ success: false, verified: false, message: "Invalid OTP" });
//     }
// });




// // **Start the server**
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

















const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcyrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3500;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/userLoginDetails');
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

app.use(bodyParser.json());
app.use(cors());


const otpStore = {}; // Store OTPs temporarily

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to Email OTP Verification API');
});

// Check if user exists
app.post('/check-user', async (req, res) => {
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
app.post('/check-user-exists', async (req, res) => {
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

// // Create new user
// app.post('/create-user', async (req, res) => {
//   const { userName, userEmail, userPhone } = req.body;
  
//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({UserEmail: userEmail });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Create new user
//     const newUser = new User({ 
        
//  UserName: userName,
//       UserEmail: userEmail,
//       UserPhone: userPhone

//     });
//     await newUser.save();
    
//     res.json({ success: true, user: newUser });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });




// Create new user
app.post('/create-user', async (req, res) => {
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

// // **Send Email OTP**
// app.post('/send-email', async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     // Generate 4-digit OTP
//   //  const otp = Math.floor(100000 + Math.random() * 900000); //6 digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000);  //4 digit OTP

//     otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

//     // Configure email transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'ihtark5@gmail.com',
//             pass: 'tthr usdb xnzq qbgc' // Use App Password (Not your actual Gmail password)
//         }
//     });


//     // Email content
//     const mailOptions = {
//         from: 'ihtark5@gmail.com',
//         to: email,
//         subject: 'Your OTP for Email Verification',
//         text: `Hello,\n\nYour OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nBest regards,\n Adinn Outdoors`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).json({ success: false, message: "Failed to send OTP email" });
//         }
//         console.log(`Email sent: ${info.response}`);
//         res.status(200).json({ success: true, message: "OTP sent successfully" });
//     });
// });

// // **Verify Email OTP**
// app.post('/verify-email-otp',async (req, res) => {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//         return res.status(400).json({ success: false, message: "Email and OTP are required" });
//     }

//     const storedData = otpStore[email];
//     if (!storedData || Date.now() > storedData.expiresAt) {
//         return res.status(400).json({ success: false, message: "OTP expired or not found" });
//     }
//     console.log("Stored OTP:", storedData.otp, "Received OTP:", otp); // Debugging log
//     if (otp.toString() === storedData.otp.toString()) 
//       {
//         delete otpStore[email]; // Remove OTP after successful verification
//  // Check if user exists in database
//         const user = await UserDetails.findOne({ email });

//         return res.status(200).json({ success: true, verified: true,            userExists: !!user,
//  message: "OTP verified successfully" });
//     } else {
//         return res.status(400).json({ success: false, verified: false, message: "Invalid OTP" });
//     }
// });


// Send OTP (works for both email and phone)
app.post('/send-otp', async (req, res) => {
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
        // In a real app, integrate with SMS service like Twilio here
        console.log(`OTP for ${phone}: ${otp}`); // For development only
        res.json({ success: true, message: "OTP sent to phone" });
    }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
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


// **Start the server**
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
