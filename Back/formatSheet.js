// ─────────────────────────────────────────────
// formatSheet.js — Run once to style the Leads sheet
// Usage: node formatSheet.js
// ─────────────────────────────────────────────
require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

async function formatSheet() {
  const credPath = path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
  const credentials = require(credPath);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  // Get sheet ID for the "Leads" tab
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Leads';
  const sheet = meta.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  const sheetId = sheet.properties.sheetId;

  // ── Website color palette (RGB 0–1)
  const gold       = { red: 0.788, green: 0.659, blue: 0.298 }; // #c9a84c
  const forest     = { red: 0.039, green: 0.059, blue: 0.051 }; // #0a0f0d
  const forestMid  = { red: 0.067, green: 0.102, blue: 0.082 }; // #111a15
  const cream      = { red: 0.957, green: 0.937, blue: 0.902 }; // #f4efe6
  const ink        = { red: 0.051, green: 0.067, blue: 0.031 }; // #0d1108

  const requests = [
    // 1. Freeze header row
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },

    // 2. Tab color = gold
    {
      updateSheetProperties: {
        properties: { sheetId, tabColorStyle: { rgbColor: gold } },
        fields: 'tabColorStyle',
      },
    },

    // 3. Alternating row bands (header gold / odd forest / even forestMid)
    {
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 8 },
          rowProperties: {
            headerColor:      gold,
            firstBandColor:   forest,
            secondBandColor:  forestMid,
          },
        },
      },
    },

    // 4. Header: bold, dark text, centered, taller
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 9, foregroundColor: ink },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)',
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 38 },
        fields: 'pixelSize',
      },
    },

    // 5. Data rows: cream text, vertically centered
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 8 },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 9, foregroundColor: cream },
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(textFormat,verticalAlignment)',
      },
    },

    // 6. Column widths
    ...[
      [0, 110],  // Timestamp
      [1, 165],  // Full Name
      [2, 205],  // Email
      [3, 155],  // Phone
      [4, 135],  // Country
      [5, 165],  // Investor Type
      [6, 165],  // Investment Range
      [7, 255],  // Message
    ].map(([i, px]) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: px },
        fields: 'pixelSize',
      },
    })),
  ];

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log('✅ Sheet formatted successfully');
}

formatSheet().catch(err => { console.error('❌', err.message); process.exit(1); });
