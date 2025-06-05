const express = require('express');
const Visitor = require('../models/visitor.model');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const emailConfig = require('../config/email.config');
const router = express.Router();

// Create a new visitor pre-booking
router.post('/', auth, async (req, res) => {
  try {
    const visitor = new Visitor({
      ...req.body,
      employeeEmail: req.user.email,
      createdBy: req.user._id,
      status: 'pre-approved'
    });
    await visitor.save();

    // Generate a secure token for the QR code
    const qrToken = jwt.sign(
      {
        visitorId: visitor._id,
        visitorName: visitor.name,
        visitorEmail: visitor.email,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        purpose: visitor.purpose,
        employeeId: req.user._id,
        type: 'pre-approved'
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
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          purpose: visitor.purpose
        }
      }), (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });

    // Send email to visitor with QR code
    const emailContent = {
      from: emailConfig.from,
      to: visitor.email,
      subject: 'Visitor Pre-approval QR Code',
      attachments: [{
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        cid: 'visitor-qr-code' // Content ID for referencing in the HTML
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
              <h1>Visitor Pre-approval Confirmation</h1>
            </div>
            <div class="content">
              <div class="info">
                <p><strong>Visitor Name:</strong> ${visitor.name}</p>
                <p><strong>Visit Date:</strong> ${new Date(visitor.visitDate).toLocaleDateString()}</p>
                <p><strong>Visit Time:</strong> ${visitor.visitTime}</p>
                <p><strong>Purpose:</strong> ${visitor.purpose}</p>
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

    await emailConfig.sendMail(emailContent);

    res.status(201).json({
      message: 'Visitor pre-booking successful. QR code has been sent to the visitor\'s email.',
      visitor: {
        id: visitor._id,
        name: visitor.name,
        email: visitor.email,
        visitDate: visitor.visitDate,
        visitTime: visitor.visitTime,
        status: visitor.status
      }
    });
  } catch (error) {
    console.error('Pre-booking error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all visitor pre-bookings for the logged-in employee
router.get('/', auth, async (req, res) => {
  try {
    const visitors = await Visitor.find({ createdBy: req.user._id })
      .sort({ visitDate: -1, visitTime: -1 })
      .populate('createdBy', 'name email department');
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific visitor pre-booking
router.get('/:id', auth, async (req, res) => {
  try {
    const visitor = await Visitor.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email department');
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a visitor pre-booking
router.patch('/:id', auth, async (req, res) => {
  try {
    const visitor = await Visitor.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    Object.assign(visitor, req.body);
    await visitor.save();
    res.json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a visitor pre-booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 