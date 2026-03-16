// ─────────────────────────────────────────────
// controllers/investorController.js
// Handles the investor interest form submission
// ─────────────────────────────────────────────
const { appendLeadRow } = require('../services/googleSheets');

// ── POST /api/investor-interest
const submitInvestorInterest = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phoneOrWhatsApp,
      country,
      investorType,
      estimatedInvestmentRange,
      message,
    } = req.body;

    // ── Basic anti-spam: honeypot field check
    // If 'website' field is filled, it's almost certainly a bot
    // (this field is hidden in the HTML and real users never fill it)
    if (req.body.website) {
      // Return a fake success so bots don't know they were caught
      return res.status(200).json({
        success: true,
        message: 'Thank you! We will be in touch shortly.',
      });
    }

    // ── Save to Google Sheets
    const { timestamp } = await appendLeadRow({
      fullName,
      email,
      phoneOrWhatsApp,
      country,
      investorType,
      estimatedInvestmentRange,
      message,
    });

    // ── Log (server-side only — never log sensitive data in production)
    console.log(`[LEAD] ${timestamp} — ${email} — ${country} — ${investorType}`);

    // ── Success response
    return res.status(200).json({
      success: true,
      message: 'Thank you for your interest in PAT. We will contact you within 48 hours with the full investor prospectus.',
    });

  } catch (error) {
    // Pass to global error handler
    next(error);
  }
};

module.exports = { submitInvestorInterest };
