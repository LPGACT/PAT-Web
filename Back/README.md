# PAT Backend — Lead Capture API

Simple Express.js backend that captures investor interest form submissions and stores them in Google Sheets.

---

## Folder Structure

```
pat-backend/
├── server.js                        ← Entry point
├── package.json
├── .env.example                     ← Copy to .env and fill in values
├── google-credentials.json          ← Your service account key (DO NOT commit)
│
├── routes/
│   ├── investor.js                  ← POST /api/investor-interest
│   └── health.js                    ← GET /api/health
│
├── controllers/
│   └── investorController.js        ← Business logic
│
├── services/
│   └── googleSheets.js              ← Google Sheets API integration
│
├── validation/
│   └── investorValidation.js        ← Input validation & sanitization
│
└── middleware/
    ├── cors.js                      ← CORS configuration
    ├── rateLimiter.js               ← Rate limiting (anti-spam)
    └── errorHandler.js              ← Global error handler
```

---

## Step 1 — Clone and install dependencies

```bash
# Go into the folder
cd pat-backend

# Install all packages
npm install
```

---

## Step 2 — Connect Google Sheets API

### 2.1 Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **"New Project"** → name it `pat-backend` → click **Create**
3. Make sure your new project is selected in the top dropdown

### 2.2 Enable Google Sheets API

1. In the left menu go to **APIs & Services → Library**
2. Search for **"Google Sheets API"**
3. Click it → click **Enable**

### 2.3 Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → choose **Service Account**
3. Name it `pat-sheets-writer` → click **Create and Continue**
4. Skip the optional steps → click **Done**

### 2.4 Download the JSON Key

1. In the Credentials page, click on your new service account
2. Go to the **Keys** tab
3. Click **Add Key → Create new key → JSON**
4. A file downloads automatically — rename it to:
   ```
   google-credentials.json
   ```
5. Move it into your `pat-backend/` folder

> ⚠️ Never commit this file to Git. It's already in `.gitignore`.

### 2.5 Create your Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet — name it `PAT Leads`
3. Rename the first tab (bottom) to exactly: `Leads`
4. Add these headers in Row 1:

   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | Timestamp | Full Name | Email | Phone / WhatsApp | Country | Investor Type | Investment Range | Message |

5. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit
   ```

### 2.6 Share the sheet with the service account

1. Open your Google Sheet
2. Click **Share** (top right)
3. Paste the service account email — looks like:
   ```
   pat-sheets-writer@your-project.iam.gserviceaccount.com
   ```
   (Find it in your `google-credentials.json` under `"client_email"`)
4. Set role to **Editor**
5. Click **Send**

---

## Step 3 — Configure environment variables

```bash
# Copy the example file
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5500
GOOGLE_SPREADSHEET_ID=paste_your_spreadsheet_id_here
GOOGLE_SHEET_NAME=Leads
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-credentials.json
```

---

## Step 4 — Run locally

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ PAT Backend running on port 3000
   Environment : development
   Health check: http://localhost:3000/api/health
```

---

## Step 5 — Test it

### Health check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "project": "PAT Backend",
  "timestamp": "2026-03-11T14:30:00.000Z",
  "environment": "development"
}
```

### Form submission
```bash
curl -X POST http://localhost:3000/api/investor-interest \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "email": "john@example.com",
    "phoneOrWhatsApp": "+44 7911 123456",
    "country": "United Kingdom",
    "investorType": "Individual / HNWI",
    "estimatedInvestmentRange": "USD 25,000 – 100,000",
    "message": "Interested in learning more about the token structure."
  }'
```

Expected success response:
```json
{
  "success": true,
  "message": "Thank you for your interest in PAT. We will contact you within 48 hours with the full investor prospectus."
}
```

Expected validation error response (missing fields):
```json
{
  "success": false,
  "message": "Please check the form fields.",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address." },
    { "field": "country", "message": "Country is required." }
  ]
}
```

---

## Step 6 — Connect your HTML form

In your landing page, replace the form submit button logic with this fetch call:

```javascript
async function handleSubmit() {
  const body = {
    fullName:                 document.getElementById('fname').value + ' ' + document.getElementById('lname').value,
    email:                    document.getElementById('email').value,
    phoneOrWhatsApp:          document.getElementById('phone').value,
    country:                  document.getElementById('country').value,
    investorType:             document.getElementById('type').value,
    estimatedInvestmentRange: document.getElementById('amount').value,
    message:                  document.getElementById('message').value,
    website: ''               // honeypot — leave empty
  };

  try {
    const res  = await fetch('http://localhost:3000/api/investor-interest', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      // Show success state
      document.getElementById('contactForm').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'flex';
    } else {
      alert(data.message || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    alert('Connection error. Please try again.');
  }
}
```

> In production, replace `http://localhost:3000` with your live server URL.

---

## Anti-spam features

| Feature | How it works |
|---------|-------------|
| **Rate limiting (global)** | Max 100 requests per IP per 15 min |
| **Rate limiting (form)** | Max 5 submissions per IP per hour |
| **Honeypot field** | Hidden `website` field — bots fill it, humans don't |
| **Input validation** | All fields validated with strict rules |
| **Input sanitization** | HTML tags stripped to prevent XSS |
| **Enum whitelist** | `investorType` and `range` must match exact allowed values |
| **Payload size limit** | JSON body capped at 10kb |

---

## Deploying to production

Recommended platforms (free tiers available):

| Platform | Notes |
|----------|-------|
| **Railway** | Easiest — connects to GitHub, auto-deploys |
| **Render** | Free tier, easy env var setup |
| **Fly.io** | More control, great for Node.js |
| **VPS (DigitalOcean)** | Full control, use PM2 to keep it running |

For any platform:
1. Set all `.env` variables in the platform's dashboard
2. For `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` — paste the entire JSON as a single line
3. Update `ALLOWED_ORIGIN` to your real domain
4. Update the fetch URL in your HTML form to your live server URL

---

## .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
.env
google-credentials.json
```
