const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const User = require('../models/User');
const Visitor = require('../models/visitor.model');
const emailConfig = require('../config/email.config');
const auth = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register visitor by security guard with image
router.post('/register', upload.single('visitorImage'), async (req, res) => {
    try {
        const { visitorName, visitorEmail, visitorPhone, purpose, employeeEmail } = req.body;
        
        // Check if employee exists
        const employee = await User.findOne({ email: employeeEmail });
        if (!employee) {
            console.log('Employee not found:', employeeEmail); // Debug log
            return res.status(404).json({ 
                status: 'error',
                message: 'Employee not found'
            });
        }

        // Get current date and time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

        // Create visitor record
        const visitor = new Visitor({
            name: visitorName,
            email: visitorEmail,
            phone: visitorPhone,
            purpose: purpose,
            employeeEmail: employeeEmail,
            visitDate: currentDate,
            visitTime: currentTime,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            status: 'pending'
        });
        await visitor.save();

        // Generate approval/rejection tokens
        const approveToken = jwt.sign(
            { visitorId: visitor._id, action: 'approve' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        const rejectToken = jwt.sign(
            { visitorId: visitor._id, action: 'reject' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Convert image buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');
        const imageType = req.file.mimetype;

        // Create email content with approval/rejection links
        const emailContent = {
            from: emailConfig.from,
            to: employeeEmail,
            subject: 'New Visitor Request - Action Required',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .email-container {
                            padding: 20px;
                            background-color: #f9f9f9;
                            border-radius: 10px;
                        }
                        .header {
                            background-color: #3b82f6;
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                            margin: -20px -20px 20px -20px;
                        }
                        .visitor-info {
                            background-color: white;
                            padding: 20px;
                            border-radius: 8px;
                            margin-bottom: 20px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .visitor-image {
                            width: 200px;
                            height: 200px;
                            object-fit: cover;
                            border-radius: 8px;
                            margin: 10px auto;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>New Visitor Request</h1>
                            <p>A visitor has requested to meet you</p>
                        </div>
                        
                        <div class="visitor-info">
                            <p><span style="font-weight: bold; color: #3b82f6;">Visitor Name:</span> ${visitorName}</p>
                            <p><span style="font-weight: bold; color: #3b82f6;">Email:</span> ${visitorEmail}</p>
                            <p><span style="font-weight: bold; color: #3b82f6;">Phone:</span> ${visitorPhone}</p>
                            <p><span style="font-weight: bold; color: #3b82f6;">Purpose of Visit:</span> ${purpose}</p>
                            
                            <img src="cid:visitor-image" 
                                 alt="Visitor's Photo" 
                                 style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px auto; display: block;" />
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.BACKEND_URL}/api/visitors/approve/${approveToken}" 
                               style="display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px; background-color: #3b82f6; color: white !important;">
                               Approve Visit
                            </a>
                            <a href="${process.env.BACKEND_URL}/api/visitors/reject/${rejectToken}" 
                               style="display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px; background-color: #64748b; color: white !important;">
                               Reject Visit
                            </a>
                        </div>

                        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                            <p>This is an automated message from the Visitor Management System.</p>
                            <p>Please respond within 24 hours as this request will expire.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [{
                filename: 'visitor-image.jpg',
                content: req.file.buffer,
                cid: 'visitor-image'
            }]
        };

        // Send email using the new configuration
        await emailConfig.sendMail(emailContent);

        res.status(201).json({
            message: 'Visitor registered successfully and notification sent to employee',
            visitor: {
                id: visitor._id,
                name: visitor.name,
                status: visitor.status
            }
        });
    } catch (error) {
        console.error('Error in visitor registration:', error);
        return res.status(500).json({ 
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
});

// Handle visitor approval
router.get('/approve/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        if (decoded.action !== 'approve') {
            return res.status(400).json({ message: 'Invalid approval token' });
        }

        const visitor = await Visitor.findByIdAndUpdate(
            decoded.visitorId,
            { status: 'approved' },
            { new: true }
        );

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        // Generate a secure token for the QR code
        const qrToken = jwt.sign(
            {
                visitorId: visitor._id,
                visitorName: visitor.name,
                visitorEmail: visitor.email,
                purpose: visitor.purpose,
                employeeEmail: visitor.employeeEmail,
                type: 'approved'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Generate QR code as a Buffer
        const qrCodeBuffer = await new Promise((resolve, reject) => {
            qrcode.toBuffer(JSON.stringify({
                type: 'visitor',
                data: {
                    token: qrToken,
                    visitorName: visitor.name,
                    purpose: visitor.purpose
                }
            }), (err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });

        // Send QR code to visitor
        const visitorEmailContent = {
            from: emailConfig.from,
            to: visitor.email,
            subject: 'Your Visit Has Been Approved - QR Code Attached',
            attachments: [{
                filename: 'qrcode.png',
                content: qrCodeBuffer,
                cid: 'visitor-qr-code'
            }],
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #3b82f6;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 20px;
                            border-radius: 0 0 10px 10px;
                        }
                        .qr-code {
                            text-align: center;
                            margin: 20px 0;
                        }
                        .qr-code img {
                            max-width: 200px;
                        }
                        .info {
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Visit Approval Confirmation</h1>
                        </div>
                        <div class="content">
                            <div class="info">
                                <p>Dear ${visitor.name},</p>
                                <p>Your visit request has been approved. Please find your QR code below.</p>
                                <p><strong>Visit Details:</strong></p>
                                <p><strong>Purpose:</strong> ${visitor.purpose}</p>
                                <p><strong>Employee:</strong> ${visitor.employeeEmail}</p>
                            </div>
                            <div class="qr-code">
                                <p><strong>Your QR Code:</strong></p>
                                <img src="cid:visitor-qr-code" alt="Visitor QR Code" style="max-width: 200px;" />
                                <p>Please present this QR code at the security desk when you arrive.</p>
                            </div>
                            <div class="footer">
                                <p>This QR code is valid for 24 hours from the time of generation.</p>
                                <p>If you have any questions, please contact the reception.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send email with QR code to visitor
        await emailConfig.sendMail(visitorEmailContent);

        // Send success response page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f9f9f9;
                    }
                    .success-container {
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .success-title {
                        color: #3b82f6;
                        margin-bottom: 20px;
                    }
                    .success-message {
                        color: #333;
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <div class="success-container">
                    <h2 class="success-title">Visit Approved Successfully</h2>
                    <p class="success-message">You have approved the visit request from ${visitor.name}</p>
                    <p class="success-message">A QR code has been sent to the visitor's email.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in visitor approval:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle visitor rejection
router.get('/reject/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        if (decoded.action !== 'reject') {
            return res.status(400).json({ message: 'Invalid rejection token' });
        }

        const visitor = await Visitor.findByIdAndUpdate(
            decoded.visitorId,
            { status: 'rejected' },
            { new: true }
        );

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f9f9f9;
                    }
                    .reject-container {
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .reject-title {
                        color: #64748b;
                        margin-bottom: 20px;
                    }
                    .reject-message {
                        color: #333;
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <div class="reject-container">
                    <h2 class="reject-title">Visit Request Rejected</h2>
                    <p class="reject-message">You have rejected the visit request from ${visitor.name}</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in visitor rejection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify QR code
router.post('/verify-qr', async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get visitor details
        const visitor = await Visitor.findById(decoded.visitorId);
        
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        // Check visit timing
        const visitDateTime = new Date(`${visitor.visitDate.toDateString()} ${visitor.visitTime}`);
        const now = new Date();

        // If visit is from a different date
        if (visitDateTime.toDateString() !== now.toDateString()) {
            return res.status(400).json({ 
                message: 'Visit is scheduled for a different date',
                visitor: {
                    ...visitor.toObject(),
                    isExpired: true
                }
            });
        }

        // If visit is in the future (same day)
        if (visitDateTime > now) {
            return res.status(400).json({ 
                message: 'Meeting time has not arrived yet',
                visitor: {
                    ...visitor.toObject(),
                    isFuture: true,
                    scheduledTime: visitDateTime
                }
            });
        }

        // Check if already visited
        if (visitor.status === 'visited') {
            return res.status(400).json({
                message: 'Visitor has already checked in',
                visitor: visitor
            });
        }

        // Return visitor details - Valid only if:
        // 1. It's the same day
        // 2. Current time is >= scheduled time
        // 3. Not already visited
        res.json({
            message: 'QR code is valid',
            visitor: visitor
        });
    } catch (error) {
        console.error('QR verification error:', error);
        res.status(400).json({ message: 'Invalid QR code' });
    }
});

// Mark visitor as visited
router.post('/mark-visited', async (req, res) => {
    try {
        const { visitorId } = req.body;
        
        const visitor = await Visitor.findByIdAndUpdate(
            visitorId,
            {
                status: 'visited',
                actualVisitTime: new Date()
            },
            { new: true }
        );

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        res.json({
            message: 'Visit marked as completed',
            visitor: visitor
        });
    } catch (error) {
        console.error('Error marking visit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 