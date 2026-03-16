// ─────────────────────────────────────────────
// routes/investor.js
// Defines the investor interest endpoint
// ─────────────────────────────────────────────
const express    = require('express');
const router     = express.Router();

const { formLimiter }                                        = require('../middleware/rateLimiter');
const { investorValidationRules, handleValidationErrors }    = require('../validation/investorValidation');
const { submitInvestorInterest }                             = require('../controllers/investorController');

// POST /api/investor-interest
// Flow: formLimiter → validate → sanitize → controller → Google Sheets
router.post(
  '/investor-interest',
  formLimiter,                   // max 5 submissions per IP per hour
  investorValidationRules,       // validate & sanitize fields
  handleValidationErrors,        // return 422 if validation fails
  submitInvestorInterest         // save to Sheets & return response
);

module.exports = router;
