// Single entry point the API routes import from. Uses the real Google
// Sheets backend when credentials are configured (production / Vercel),
// otherwise falls back to the in-memory mock db (local development without
// secrets set up).
import * as mockDb from "./db";
import * as sheetsDb from "./sheetsDb";

const useSheets = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.SPREADSHEET_ID);

export const db = useSheets ? sheetsDb : mockDb;
