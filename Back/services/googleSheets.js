// ─────────────────────────────────────────────
// services/googleSheets.js
// Handles all interaction with Google Sheets API
// ─────────────────────────────────────────────
const { google } = require('googleapis');
const path = require('path');

// ── Load credentials from env
// Supports two methods:
//   A) Path to a JSON file  (GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
//   B) Raw JSON string      (GOOGLE_SERVICE_ACCOUNT_KEY_JSON)
function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_JSON is not valid JSON.');
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    const absPath = path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
    return require(absPath);
  }

  throw new Error(
    'No Google credentials found. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_KEY_JSON in .env'
  );
}

// ── Build an authenticated Google Sheets client
function getSheetsClient() {
  const credentials = getCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// ── Append a new lead row to the spreadsheet
// Each call adds one row at the bottom of the sheet
async function appendLeadRow(leadData) {
  const sheets         = getSheetsClient();
  const spreadsheetId  = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName      = process.env.GOOGLE_SHEET_NAME || 'Leads';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID is not set in .env');
  }

  // Build the row in the exact order of your sheet columns:
  // Timestamp | Full Name | Email | Phone | Country | Investor Type | Investment Range | Message
  const now = new Date();
  const timestamp = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

  const row = [
    timestamp,
    leadData.fullName,
    leadData.email,
    leadData.phoneOrWhatsApp,
    leadData.country,
    leadData.investorType,
    leadData.estimatedInvestmentRange,
    leadData.message || '', // optional field
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:H`,  // columns A through H
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });

  return { timestamp };
}

module.exports = { appendLeadRow };
