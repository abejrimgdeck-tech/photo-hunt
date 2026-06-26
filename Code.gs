const SPREADSHEET_ID = "1jcSk2sXincBCnUEGWSzMfqWlLP16HDTKhA8ohlj8Ht0";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('PHOTO HUNT GUESSING GAME')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function verifyLogin(userId, passcode) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("🔐 AUTH");
    if (!sheet) return { success: false, message: "Server Error: Auth Sheet not found." };
    
    var data = sheet.getDataRange().getValues();
    if (!data || data.length < 2) return { success: false, message: "No user data found in sheet." };
    
    for (var i = 1; i < data.length; i++) {
      var rowId = (data[i][0] || "").toString().trim();
      var rowPass = (data[i][2] || "").toString().trim();
      var accessLevel = parseInt(data[i][3]) || 0;
      
      if (rowId === userId && rowPass === passcode) {
        return { success: true, userId: rowId, level: accessLevel };
      }
    }
    return { success: false, message: "Invalid User ID or Passcode." };
  } catch (e) {
    return { success: false, message: "Login Error: " + e.message };
  }
}

function getLeaderboard() {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("🔎 PHOTO HUNT");
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    // Check if sheet has header + data
    if (!data || data.length < 2) return [];
    
    var results = [];
    // Start at row 1 (skipping header at row 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row && row.length >= 5) {
        // Parse score safely: get the numeric part before "/"
        var rawScore = (row[4] || "0").toString();
        var cleanScore = parseInt(rawScore.split('/')[0]);
        
        if (!isNaN(cleanScore)) {
          results.push({
            date: new Date(row[0]),
            name: row[2] || "Unknown",
            score: cleanScore
          });
        }
      }
    }

    // Sort by Score (high to low), then Date (newest first)
    results.sort(function(a, b) { 
      return b.score - a.score || b.date - a.date; 
    });
    
    // Return top 100 entries
    return results.slice(0, 100);
  } catch (e) {
    return []; 
  }
}

function saveResult(userData) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("🔎 PHOTO HUNT");
    if (!sheet) return false;
    
    var timestamp = new Date();
    sheet.insertRowBefore(2);
    // Timestamp, UserID, Name, Gmail, Score, Time, Level
    sheet.getRange(2, 1, 1, 7).setValues([[
      timestamp, 
      userData.userId,
      userData.name, 
      userData.gmail,
      userData.score + "/50", 
      userData.timeRemaining || "N/A", 
      userData.level
    ]]);
    return true;
  } catch(e) {
    return false;
  }
}