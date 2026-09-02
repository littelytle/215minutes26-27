// Real Google Sheets–backed data layer. Talks to the SAME spreadsheet
// layout as the original Streamlit app (staff / students / logs sheets),
// so it can be pointed at the existing production sheet with no migration.
import { google, sheets_v4 } from "googleapis";
import type { Staff, Student, LogEntry, Subject, Grade, LogUpdate } from "./types";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID as string;

const STAFF_HEADERS = ["id", "name", "color"];
const STUDENTS_HEADERS = [
  "id", "name", "grade", "active_subject", "goal_math", "goal_english", "goal_task_completion",
];
const LOGS_HEADERS = ["id", "student_id", "subject", "staff", "minutes", "date", "note", "batch_id"];

let cachedClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON as string;
  const creds = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

async function ensureSheet(title: string, headers: string[]): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = meta.data.sheets?.some(s => s.properties?.title === title);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

// Patches an already-existing sheet (created before this column existed) by
// appending a header cell for it, without disturbing existing data/columns.
// Expands the sheet's grid first if needed — writing past the current grid
// width (e.g. column H on a 7-column-wide sheet) is rejected by the API.
async function ensureHeaderColumn(title: string, col: string): Promise<void> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A1:Z1`,
  });
  const header = res.data.values?.[0] || [];
  if (header.includes(col)) return;

  const neededCols = header.length + 1;
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === title);
  const sheetId = sheet?.properties?.sheetId;
  const gridCols = sheet?.properties?.gridProperties?.columnCount ?? 0;
  if (sheetId !== undefined && sheetId !== null && gridCols < neededCols) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ appendDimension: { sheetId, dimension: "COLUMNS", length: neededCols - gridCols } }],
      },
    });
  }

  const colLetter = String.fromCharCode("A".charCodeAt(0) + header.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!${colLetter}1`,
    valueInputOption: "RAW",
    requestBody: { values: [[col]] },
  });
}

async function readRows(title: string): Promise<Record<string, string>[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length < 1) return [];
  const [header, ...body] = rows;
  return body
    .filter(r => r.some(c => c !== undefined && c !== ""))
    .map(r => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { obj[h] = r[i] ?? ""; });
      return obj;
    });
}

async function appendRow(title: string, headers: string[], row: (string | number)[]): Promise<void> {
  await ensureSheet(title, headers);
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

// Row index (1-based, including header) for a record matched by column value.
async function findRowIndex(title: string, headers: string[], col: string, value: string): Promise<number | null> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length < 1) return null;
  const header = rows[0];
  const colIdx = header.indexOf(col);
  if (colIdx === -1) return null;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][colIdx]) === String(value)) return i + 1; // 1-based sheet row
  }
  return null;
}

// All row indices (1-based, including header) matching a column value, in sheet order.
async function findAllRowIndices(title: string, headers: string[], col: string, value: string): Promise<number[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length < 1) return [];
  const header = rows[0];
  const colIdx = header.indexOf(col);
  if (colIdx === -1) return [];
  const matches: number[] = [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][colIdx]) === String(value)) matches.push(i + 1);
  }
  return matches;
}

async function updateCell(title: string, row: number, colIdx: number, value: string | number): Promise<void> {
  const sheets = getClient();
  const colLetter = String.fromCharCode("A".charCodeAt(0) + colIdx);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!${colLetter}${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}

async function deleteRow(title: string, rowIndex: number): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetId = meta.data.sheets?.find(s => s.properties?.title === title)?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: rowIndex - 1, endIndex: rowIndex },
        },
      }],
    },
  });
}

function nextId(recs: Record<string, string>[]): number {
  return recs.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

export async function getStaff(): Promise<Staff[]> {
  await ensureSheet("staff", STAFF_HEADERS);
  const recs = await readRows("staff");
  return recs.map(r => ({ id: Number(r.id), name: r.name, color: r.color }));
}

export async function getStudents(): Promise<Student[]> {
  await ensureSheet("students", STUDENTS_HEADERS);
  const recs = await readRows("students");
  return recs.map(r => ({
    id: Number(r.id),
    name: r.name,
    grade: r.grade as Grade,
    goalMath: Number(r.goal_math) || 0,
    goalEnglish: Number(r.goal_english) || 0,
    goalTaskCompletion: Number(r.goal_task_completion) || 0,
  }));
}

export async function getLogs(): Promise<LogEntry[]> {
  await ensureSheet("logs", LOGS_HEADERS);
  await ensureHeaderColumn("logs", "batch_id");
  const recs = await readRows("logs");
  return recs.map(r => ({
    id: Number(r.id),
    studentId: Number(r.student_id),
    subject: r.subject as Subject,
    staff: r.staff,
    minutes: Number(r.minutes) || 0,
    date: r.date,
    note: r.note || "",
    batchId: r.batch_id || "",
  }));
}

export async function addStudent(
  name: string, grade: Grade, goals: { Math: number; English: number; "Task Completion": number }
): Promise<void> {
  await ensureSheet("students", STUDENTS_HEADERS);
  const recs = await readRows("students");
  await appendRow("students", STUDENTS_HEADERS, [
    nextId(recs), name, grade, "Math", goals.Math, goals.English, goals["Task Completion"],
  ]);
}

export async function updateStudent(
  id: number, newName: string | undefined, goals: Partial<Record<Subject, number>> | undefined
): Promise<void> {
  const row = await findRowIndex("students", STUDENTS_HEADERS, "id", String(id));
  if (!row) return;
  if (newName) await updateCell("students", row, STUDENTS_HEADERS.indexOf("name"), newName);
  if (goals) {
    const map: Record<Subject, string> = {
      Math: "goal_math", English: "goal_english", "Task Completion": "goal_task_completion",
    };
    for (const [subj, val] of Object.entries(goals) as [Subject, number][]) {
      await updateCell("students", row, STUDENTS_HEADERS.indexOf(map[subj]), val);
    }
  }
}

export async function deleteStudent(id: number): Promise<void> {
  const row = await findRowIndex("students", STUDENTS_HEADERS, "id", String(id));
  if (row) await deleteRow("students", row);
}

export async function addStaffMember(name: string, color: string): Promise<void> {
  await ensureSheet("staff", STAFF_HEADERS);
  const recs = await readRows("staff");
  await appendRow("staff", STAFF_HEADERS, [nextId(recs), name, color]);
}

export async function updateStaffNames(newNames: Record<string, string>): Promise<void> {
  const recs = await readRows("staff");
  const oldNames: Record<number, string> = {};
  for (const r of recs) oldNames[Number(r.id)] = r.name;

  for (const [idStr, name] of Object.entries(newNames)) {
    const id = Number(idStr);
    const row = await findRowIndex("staff", STAFF_HEADERS, "id", idStr);
    if (row) await updateCell("staff", row, STAFF_HEADERS.indexOf("name"), name);
    const old = oldNames[id];
    if (old && old !== name) {
      const logRecs = await readRows("logs");
      const staffColIdx = LOGS_HEADERS.indexOf("staff");
      for (let i = 0; i < logRecs.length; i++) {
        if (logRecs[i].staff === old) {
          await updateCell("logs", i + 2, staffColIdx, name);
        }
      }
    }
  }
}

export async function addLog(
  studentId: number, subject: Subject, staffName: string, minutes: number, dateISO: string, note: string,
  batchId: string
): Promise<void> {
  await ensureSheet("logs", LOGS_HEADERS);
  await ensureHeaderColumn("logs", "batch_id");
  const recs = await readRows("logs");
  await appendRow("logs", LOGS_HEADERS, [
    nextId(recs), studentId, subject, staffName, minutes, dateISO, note, batchId,
  ]);
}

const LOG_UPDATE_COL: Record<keyof LogUpdate, string> = {
  subject: "subject", staff: "staff", minutes: "minutes", date: "date", note: "note",
};

export async function updateLog(id: number, updates: LogUpdate): Promise<void> {
  await ensureHeaderColumn("logs", "batch_id");
  const row = await findRowIndex("logs", LOGS_HEADERS, "id", String(id));
  if (!row) return;
  for (const [key, value] of Object.entries(updates) as [keyof LogUpdate, string | number][]) {
    await updateCell("logs", row, LOGS_HEADERS.indexOf(LOG_UPDATE_COL[key]), value);
  }
}

export async function deleteLog(id: number): Promise<void> {
  const row = await findRowIndex("logs", LOGS_HEADERS, "id", String(id));
  if (row) await deleteRow("logs", row);
}

export async function updateLogsByBatch(batchId: string, updates: LogUpdate): Promise<void> {
  await ensureHeaderColumn("logs", "batch_id");
  const rows = await findAllRowIndices("logs", LOGS_HEADERS, "batch_id", batchId);
  for (const row of rows) {
    for (const [key, value] of Object.entries(updates) as [keyof LogUpdate, string | number][]) {
      await updateCell("logs", row, LOGS_HEADERS.indexOf(LOG_UPDATE_COL[key]), value);
    }
  }
}

export async function deleteLogsByBatch(batchId: string): Promise<void> {
  const rows = await findAllRowIndices("logs", LOGS_HEADERS, "batch_id", batchId);
  for (const row of rows.sort((a, b) => b - a)) await deleteRow("logs", row);
}
