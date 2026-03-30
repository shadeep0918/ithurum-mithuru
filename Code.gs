// 1. In Google Sheets, click Extensions > Apps Script
// 2. Paste this entire code
// 3. Click Deploy > New Deployment
// 4. Select type: Web App
// 5. Execute as: Me
// 6. Who has access: Anyone
// 7. Click Deploy, authorize the app, and copy the Web App URL
// 8. Paste the URL into the GOOGLE_SCRIPT_URL variable in your React app's App.jsx

const SHEET_NAME = 'Transactions';

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Item', 'Amount', 'Category', 'PaidBy', 'Date']);
    sheet.getRange("A1:F1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      setup();
      sheet = doc.getSheetByName(SHEET_NAME);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    const newRow = [
      new Date(), // Timestamp
      data.item || '',
      data.amount || 0,
      data.category || '',
      data.paidBy || '',
      data.date || ''
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'data': newRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().toLowerCase());
    const rows = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowData = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = data[i][j];
      }
      rows.push(rowData);
    }
    
    // Sort so newest dates come first
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'error': err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
