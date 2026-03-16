// ─────────────────────────────────────────────
// validation/investorValidation.js
// Validates and sanitizes the investor lead form
// ─────────────────────────────────────────────
const { body, validationResult } = require('express-validator');

// ── Allowed values for enum fields
const ALLOWED_INVESTOR_TYPES = [
  'Individual / HNWI',
  'Family Office',
  'Fund / Institutional',
  'Other',
];

const ALLOWED_INVESTMENT_RANGES = [
  'USD 5,000 – 25,000',
  'USD 25,000 – 100,000',
  'USD 100,000 – 500,000',
  'USD 500,000+',
];

// ── Validation rules chain
const investorValidationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters.')
    .escape(), // strips HTML tags — prevents XSS

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email is too long.'),

  body('phoneOrWhatsApp')
    .trim()
    .notEmpty().withMessage('Phone or WhatsApp is required.')
    .isLength({ min: 5, max: 30 }).withMessage('Phone must be between 5 and 30 characters.')
    .escape(),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Country must be between 2 and 80 characters.')
    .escape(),

  body('investorType')
    .trim()
    .notEmpty().withMessage('Investor type is required.')
    .isIn(ALLOWED_INVESTOR_TYPES)
    .withMessage(`Investor type must be one of: ${ALLOWED_INVESTOR_TYPES.join(', ')}.`),

  body('estimatedInvestmentRange')
    .trim()
    .notEmpty().withMessage('Estimated investment range is required.')
    .isIn(ALLOWED_INVESTMENT_RANGES)
    .withMessage(`Investment range must be one of: ${ALLOWED_INVESTMENT_RANGES.join(', ')}.`),

  body('message')
    .optional({ checkFalsy: true }) // not required
    .trim()
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters.')
    .escape(),
];

// ── Middleware that runs after validation rules — returns errors if any
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Please check the form fields.',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = { investorValidationRules, handleValidationErrors };
