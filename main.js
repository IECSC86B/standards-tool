// Program state object
let program = {
  // Expected sheets and columns
  expectedSheetsAndColumns: {
    "1": [
      "Connector type",
      "Fibre type",
      "PC or APC ferrule end face",
      "Attenuation and return loss grades",
      "Visual connector end face requirements",
      "Connector end face geometric and ferrule parameters",
      "Reference connector attenuation requirements",
      "Reference connector end face geometric and ferrule parameters"
    ],
    "2": [
      "Connector type",
      "Mechanical connector interface"
    ],
    "3": [
      "Performance category - operating service environment (temperature range)",
      "Fibre type",
      "Mechanical and environmental connector performance (terminated as pigtail or patchcord)"
    ],
    "4": [
      "Connector type",
      "Cable type",
      "Mechanical and environmental cable performance"
    ],
    "5": [
      "Connector type",
      "Attenuation measurement of randomly mated connectors"
    ],
    "6": [
      "Connector type",
      "Fibre type",
      "Attenuation and return loss measurement of installed cable plant"
    ],
    "7": [
      "Fibre type",
      "Standard"
    ],
    "8": [
      "Standard",
      "Scope"
    ],
    "Filter 1": [
      "IN1",
      "IN2",
      "IN4"
    ],
    "Filter 2": [
      "IN2",
      "IN4",
      "IN6"
    ],
    "Filter 3": [
      "IN5",
      "IN2"
    ],
    "Filter 4": [
      "IN3",
      "IN1"
    ],
    "Filter 5": [
      "IN7"
    ]
  },

  // Input options
  inputOptions: {
    "IN1": ["LC", "LSH", "MDC", "MPO 1x12", "MPO 1x16", "MPO 2x12", "MPO 2x16", "SAC", "SC", "SEN"],
    "IN2": ["Single-mode", "Multimode"],
    "IN3": ["Primary coated fibre", "Buffered fibre", "Ribbon fibre", "Reinforced cable"],
    "IN4": ["PC", "APC"],
    "IN5": ["B (mean ≤ 0,12 dB; at least 97 % ≤ 0,25 dB)", "C (mean ≤ 0,25 dB; at least 97 % ≤ 0,5 dB)", "D (mean ≤ 0,5 dB; at least 97 % ≤ 1,0 dB)", "Bm (mean ≤ 0,3 dB; at least 97 % ≤ 0,6 dB)", "Cm (mean ≤ 0,5 dB; at least 97 % ≤ 1,0 dB)"],
    "IN6": ["1 (≥ 60 dB, mated)", "2 (≥ 45 dB, mated)", "3 (≥ 35 dB, mated)", "4 (≥ 26 dB, mated)", "1m (≥ 45 dB, mated)", "2m (≥ 20 dB, mated)"],
    "IN7": ["C", "C-HD", "OP", "OP+", "OP+-HD", "OP-HD"]
  },

  // Data tables
  tables: {},

  // Input values
  IN1: false,
  IN2: false,
  IN3: false,
  IN4: false,
  IN5: false,
  IN6: false,
  IN7: false,

  // Output values
  OUT1: "To be assigned",
  OUT2: "To be assigned",
  OUT3: "To be assigned",
  OUT4: "To be assigned",
  OUT5: "To be assigned",
  OUT6: "To be assigned",
  OUT7: "To be assigned",
  OUT8: "To be assigned",
  OUT9: "To be assigned",
  OUT10: "To be assigned",
  OUT11: "To be assigned",
  OUT12: "To be assigned",
  OUT13: "To be assigned",
  OUT14: "To be assigned",
  OUT15: "To be assigned",
  OUT16: "To be assigned",
  OUT17: "To be assigned",
  OUT18: "To be assigned",
  OUT19: "To be assigned"
};

// Reset input values
function resetInputValues() {
  program.IN1 = false;
  program.IN2 = false;
  program.IN3 = false;
  program.IN4 = false;
  program.IN5 = false;
  program.IN6 = false;
  program.IN7 = false;
}

// Reset inputs button handler
function resetInputs() {
  console.log("Resetting inputs and outputs");
  document.getElementById("IN1").selectedIndex = -1;
  document.getElementById("IN2").selectedIndex = -1;
  document.getElementById("IN3").selectedIndex = -1;
  document.getElementById("IN4").selectedIndex = -1;
  document.getElementById("IN5").selectedIndex = -1;
  document.getElementById("IN6").selectedIndex = -1;
  document.getElementById("IN7").selectedIndex = -1;

  // Reset all disabled options
  for (let input in program.inputOptions) {
    let values = program.inputOptions[input];
    for (let i = 0; i < values.length; i++) {
      let option = values[i];
      let selectorString = "#" + input + " option[value='" + option + "']";
      let element = document.querySelector(selectorString);
      if (element) {
        element.disabled = false;
      }
    }
  }

  resetInputValues();
  resetOutputs();
  applyOutputs();
}

// Filter tables based on inputs
function filterTables(tables, columnHeadings, inputs) {
  let filteredTables = {};

  for (let key in tables) {
    let table = tables[key];
    let colHeadsThisTable = columnHeadings[key];
    let filteredRows = [];

    // Start with all rows
    for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
      let row = table[rowIndex];
      let rowMatches = true;

      // Check each column heading
      for (let i = 0; i < colHeadsThisTable.length; i++) {
        let colHead = colHeadsThisTable[i];
        if (inputs[colHead]) {
          let inputValue = inputs[colHead];
          if (row[colHead] !== inputValue) {
            rowMatches = false;
            break;
          }
        }
      }

      if (rowMatches) {
        filteredRows.push(row);
      }
    }

    filteredTables[key] = filteredRows;
  }

  return filteredTables;
}

// Enforce only options - if only one option remains, select it
function enforceOnlyOptions(tables, inputs) {
  for (let key in tables) {
    let table = tables[key];
    if (table.length === 1) {
      let row = table[0];
      for (let column in row) {
        inputs[column] = row[column];
        console.log("Enforced the following value for input: " + column + ": " + inputs[column]);
      }
    }
  }
  return inputs;
}

// Update inputs based on available options
function updateInputs() {
  let tables = {
    "Filter 1": program.tables["Filter 1"],
    "Filter 2": program.tables["Filter 2"],
    "Filter 3": program.tables["Filter 3"],
    "Filter 4": program.tables["Filter 4"],
    "Filter 5": program.tables["Filter 5"]
  };

  let columnHeadings = {
    "Filter 1": program.expectedSheetsAndColumns["Filter 1"],
    "Filter 2": program.expectedSheetsAndColumns["Filter 2"],
    "Filter 3": program.expectedSheetsAndColumns["Filter 3"],
    "Filter 4": program.expectedSheetsAndColumns["Filter 4"],
    "Filter 5": program.expectedSheetsAndColumns["Filter 5"]
  };

  let inputs = {
    "IN1": program.IN1,
    "IN2": program.IN2,
    "IN3": program.IN3,
    "IN4": program.IN4,
    "IN5": program.IN5,
    "IN6": program.IN6,
    "IN7": program.IN7
  };

  let inputOptions = program.inputOptions;

  // Filter tables
  tables = filterTables(tables, columnHeadings, inputs);

  // Enforce only options
  inputs = enforceOnlyOptions(tables, inputs);

  // Reapply filters
  tables = filterTables(tables, columnHeadings, inputs);

  // Update enabled/disabled status of options
  for (let input in inputs) {
    let options = inputOptions[input];
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      let selectorString = "#" + input + " option[value='" + option + "']";
      let element = document.querySelector(selectorString);
      if (element) {
        element.disabled = false;
      }

      let isValid = true;
      for (let key in tables) {
        let table = tables[key];
        if (table.length > 0 && table[0][input] !== undefined) {
          let columnValues = [];
          for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
            columnValues.push(table[rowIndex][input]);
          }
          if (columnValues.indexOf(option) === -1) {
            console.log("option " + option + " is not valid");
            isValid = false;
            element.disabled = true;
            break;
          }
        }
      }
    }
  }
}

// Event handlers for input changes
function IN1Callback() {
  program.IN1 = document.getElementById("IN1").value;
  updateInputs();
  updateOutputs();
}

function IN2Callback() {
  program.IN2 = document.getElementById("IN2").value;
  updateInputs();
  updateOutputs();
}

function IN3Callback() {
  program.IN3 = document.getElementById("IN3").value;
  updateInputs();
  updateOutputs();
}

function IN4Callback() {
  program.IN4 = document.getElementById("IN4").value;
  updateInputs();
  updateOutputs();
}

function IN5Callback() {
  program.IN5 = document.getElementById("IN5").value;
  updateInputs();
  updateOutputs();
}

function IN6Callback() {
  program.IN6 = document.getElementById("IN6").value;
  updateInputs();
  updateOutputs();
}

function IN7Callback() {
  program.IN7 = document.getElementById("IN7").value;
  updateInputs();
  updateOutputs();
}

// Apply outputs to HTML
function applyOutputs() {
  document.getElementById("OUT1").innerHTML = program.OUT1;
  document.getElementById("OUT2").innerHTML = program.OUT2;
  document.getElementById("OUT3").innerHTML = program.OUT3;
  document.getElementById("OUT4").innerHTML = program.OUT4;
  document.getElementById("OUT5").innerHTML = program.OUT5;
  document.getElementById("OUT6").innerHTML = program.OUT6;
  document.getElementById("OUT7").innerHTML = program.OUT7;
  document.getElementById("OUT8").innerHTML = program.OUT8;
  document.getElementById("OUT9").innerHTML = program.OUT9;
  document.getElementById("OUT10").innerHTML = program.OUT10;
  document.getElementById("OUT11").innerHTML = program.OUT11;
  document.getElementById("OUT12").innerHTML = program.OUT12;
  document.getElementById("OUT13").innerHTML = program.OUT13;
  document.getElementById("OUT14").innerHTML = program.OUT14;
  document.getElementById("OUT15").innerHTML = program.OUT15;
  document.getElementById("OUT16").innerHTML = program.OUT16;
  document.getElementById("OUT17").innerHTML = program.OUT17;
  document.getElementById("OUT18").innerHTML = program.OUT18;
  document.getElementById("OUT19").innerHTML = program.OUT19;
}

// Reset outputs
function resetOutputs() {
  program.OUT1 = "To be assigned";
  program.OUT2 = "To be assigned";
  program.OUT3 = "To be assigned";
  program.OUT4 = "To be assigned";
  program.OUT5 = "To be assigned";
  program.OUT6 = "To be assigned";
  program.OUT7 = "To be assigned";
  program.OUT8 = "To be assigned";
  program.OUT9 = "To be assigned";
  program.OUT10 = "To be assigned";
  program.OUT11 = "To be assigned";
  program.OUT12 = "To be assigned";
  program.OUT13 = "To be assigned";
  program.OUT14 = "To be assigned";
  program.OUT15 = "To be assigned";
  program.OUT16 = "To be assigned";
  program.OUT17 = "To be assigned";
  program.OUT18 = "To be assigned";
  program.OUT19 = "To be assigned";

  applyOutputs();
}

// Update outputs
// try catch is there because the logic below relies on program.INX being false until it's set by the user
// ...but if you try to concatenate the string below, it will create an error
function updateOutputs() {
  try {
    console.log("IN1: " + program.IN1);
  } catch (e) {}
  try {
    console.log("IN2: " + program.IN2);
  } catch (e) {}
  try {
    console.log("IN3: " + program.IN3);
  } catch (e) {}
  try {
    console.log("IN4: " + program.IN4);
  } catch (e) {}
  try {
    console.log("IN5: " + program.IN5);
  } catch (e) {}
  try {
    console.log("IN6: " + program.IN6);
  } catch (e) {}
  try {
    console.log("IN7: " + program.IN7);
  } catch (e) {}

  resetOutputs();

  let table1 = program.tables["1"];
  let table2 = program.tables["2"];
  let table3 = program.tables["3"];
  let table4 = program.tables["4"];
  let table5 = program.tables["5"];
  let table6 = program.tables["6"];
  let table7 = program.tables["7"];
  let table8 = program.tables["8"];

  // get each output value
  // this is done in groups once the relevant inputs have been set by the user
  // in each case, the program looks up the table using inputs and uses the findRow function to get the row, then assigns the output(s) based on the column name
  
  // OUT1 and OUT9
  if (program.IN1) {
    let row = findRow(table2, { "Connector type": program.IN1 });
    if (row) {
      program.OUT1 = row["Mechanical connector interface"];
      console.log("OUT1: " + program.OUT1);
      program.OUT1 = addLink(program.OUT1);
    }

    row = findRow(table5, { "Connector type": program.IN1 });
    if (row) {
      program.OUT9 = row["Attenuation measurement of randomly mated connectors"];
      console.log("OUT9: " + program.OUT9);
      program.OUT9 = addLink(program.OUT9);
    }
  }

  // OUT2, OUT3, OUT4, OUT7, OUT8
  if (program.IN1 && program.IN2 && program.IN4) {
    let row = findRow(table1, {
      "Connector type": program.IN1,
      "Fibre type": program.IN2,
      "PC or APC ferrule end face": program.IN4
    });

    if (row) {
      program.OUT2 = row["Attenuation and return loss grades"];
      program.OUT3 = row["Visual connector end face requirements"];
      program.OUT4 = row["Connector end face geometric and ferrule parameters"];
      program.OUT7 = row["Reference connector attenuation requirements"];
      program.OUT8 = row["Reference connector end face geometric and ferrule parameters"];
    }

    console.log("OUT2: " + program.OUT2);
    console.log("OUT3: " + program.OUT3);
    console.log("OUT4: " + program.OUT4);
    console.log("OUT7: " + program.OUT7);
    console.log("OUT8: " + program.OUT8);
    // add links
    program.OUT2 = addLink(program.OUT2);
    program.OUT3 = addLink(program.OUT3);
    program.OUT4 = addLink(program.OUT4);
    program.OUT7 = addLink(program.OUT7);
    program.OUT8 = addLink(program.OUT8);
  }

  // OUT5
  if (program.IN2 && program.IN7) {
    let row = findRow(table3, {
      "Performance category - operating service environment (temperature range)": program.IN7,
      "Fibre type": program.IN2
    });

    if (row) {
      program.OUT5 = row["Mechanical and environmental connector performance (terminated as pigtail or patchcord)"];
      console.log("OUT5: " + program.OUT5);
      program.OUT5 = addLink(program.OUT5);
    }
  }

  // OUT6
  if (program.IN1 && program.IN3) {
    let row = findRow(table4, {
      "Cable type": program.IN3,
      "Connector type": program.IN1
    });

    if (row) {
      program.OUT6 = row["Mechanical and environmental cable performance"];
      console.log("OUT6: " + program.OUT6);
      program.OUT6 = addLink(program.OUT6);
    }
  }

  // OUT18
  if (program.IN2) {
    let row = findRow(table7, { "Fibre type": program.IN2 });
    if (row) {
      program.OUT18 = row["Standard"];
      console.log("OUT18: " + program.OUT18);
      program.OUT18 = addLink(program.OUT18);
    }
  }

  // OUT19
  let row = findRow(table8, { "Scope": "Attenuation measurement against reference" });
  if (row) {
    program.OUT19 = row["Standard"];
    console.log("OUT19: " + program.OUT19);
    program.OUT19 = addLink(program.OUT19);
  }

  // OUT10
  row = findRow(table8, { "Scope": "Return loss measurement" });
  if (row) {
    program.OUT10 = row["Standard"];
    console.log("OUT10: " + program.OUT10);
    program.OUT10 = addLink(program.OUT10);
  }

  // OUT11 and OUT16
  row = findRow(table8, { "Scope": "Visual connector end face inspection procedure" });
  if (row) {
    program.OUT11 = row["Standard"];
    program.OUT16 = program.OUT11;
    console.log("OUT11: " + program.OUT11);
    console.log("OUT16: " + program.OUT16);
    program.OUT11 = addLink(program.OUT11);
    program.OUT16 = addLink(program.OUT16);
  }

  // OUT12
  row = findRow(table8, { "Scope": "Visual connector end face inspection microscope requirements" });
  if (row) {
    program.OUT12 = row["Standard"];
    console.log("OUT12: " + program.OUT12);
    program.OUT12 = addLink(program.OUT12);
  }

  // OUT13
  row = findRow(table8, { "Scope": "Planning and installation of premises cabling" });
  if (row) {
    program.OUT13 = row["Standard"];
    console.log("OUT13: " + program.OUT13);
    program.OUT13 = addLink(program.OUT13);
  }

  // OUT14
  row = findRow(table8, { "Scope": "Testing of optical fibre cabling (inspection and cleaning of connector end faces, optical performance testing)" });
  if (row) {
    program.OUT14 = row["Standard"];
    console.log("OUT14: " + program.OUT14);
    program.OUT14 = addLink(program.OUT14);
  }

  // OUT15
  if (program.IN1 && program.IN2) {
    row = findRow(table6, {
      "Connector type": program.IN1,
      "Fibre type": program.IN2
    });

    if (row) {
      program.OUT15 = row["Attenuation and return loss measurement of installed cable plant"];
      console.log("OUT15: " + program.OUT15);
      program.OUT15 = addLink(program.OUT15);
    }
  }

  // OUT17
  row = findRow(table8, { "Scope": "Cleaning methods" });
  if (row) {
    program.OUT17 = row["Standard"];
    console.log("OUT17: " + program.OUT17);
    program.OUT17 = addLink(program.OUT17);
  }

  applyOutputs();
}

// program initialization
document.addEventListener("DOMContentLoaded", initializeListeners);
document.addEventListener("DOMContentLoaded", resetInputs);

// Initialize event listeners
function initializeListeners() {
  document.getElementById("IN1").addEventListener("change", IN1Callback);
  document.getElementById("IN2").addEventListener("change", IN2Callback);
  document.getElementById("IN3").addEventListener("change", IN3Callback);
  document.getElementById("IN4").addEventListener("change", IN4Callback);
  document.getElementById("IN5").addEventListener("change", IN5Callback);
  document.getElementById("IN6").addEventListener("change", IN6Callback);
  document.getElementById("IN7").addEventListener("change", IN7Callback);
  document.getElementById("reset_inputs").addEventListener("click", resetInputs);
}


// Import Excel file and convert to data object for importData()
function importExcelFile(filePath, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filePath, true);
  xhr.responseType = "arraybuffer";
  
  xhr.onload = function() {
    try {
      let workbook = XLSX.read(xhr.response, { type: "array" });
      let result = {};
      
      // Convert each sheet to an array of objects
      for (let i = 0; i < workbook.SheetNames.length; i++) {
        let sheetName = workbook.SheetNames[i];
        let worksheet = workbook.Sheets[sheetName];
        
        // Check if sheet name exists in expectedSheetsAndColumns
        if (program.expectedSheetsAndColumns[sheetName]) {
          let expectedColumns = program.expectedSheetsAndColumns[sheetName];
          let worksheetArray = worksheetToArray(worksheet);
          
          // Validate column names if data exists
          if (worksheetArray.length > 0) {
            let actualColumns = Object.keys(worksheetArray[0]);
            let columnsMatch = validateColumns(actualColumns, expectedColumns);
            
            if (columnsMatch) {
              result[sheetName] = worksheetArray;
              console.log("Sheet '" + sheetName + "' loaded successfully - columns match");
            } else {
              console.log("Sheet '" + sheetName + "' rejected - column names do not match expected columns");
            }
          } else {
            console.log("Sheet '" + sheetName + "' is empty");
          }
        } else {
          console.log("Sheet '" + sheetName + "' not found in expected sheets");
        }
      }
      
      callback(null, result);
    } catch (error) {
      callback(error, null);
    }
  };
  
  xhr.onerror = function() {
    callback(new Error("Failed to load file"), null);
  };
  
  xhr.send();
}

// Validate that imported columns match expected columns
function validateColumns(importedColumns, expectedColumns) {
  // Sort both arrays to compare
  let sortedActual = importedColumns.slice().sort();
  let sortedExpected = expectedColumns.slice().sort();
  
  // Check if they have the same length
  if (sortedActual.length !== sortedExpected.length) {
    return false;
  }
  
  // Check if all columns match
  for (let i = 0; i < sortedActual.length; i++) {
    if (sortedActual[i] !== sortedExpected[i]) {
      return false;
    }
  }
  
  return true;
}

// Load Excel file on startup
document.addEventListener("DOMContentLoaded", function() {
  importExcelFile("./assets/program_logic_v6.xlsx", function(error, data) {
    if (error) {
      console.error("Error loading Excel file:", error);
    } else {
      program.tables = data;
      console.log("Excel file loaded successfully");
      //console.log(program.tables);
    }
  });
});

// Convert Excel worksheet to array of objects
function worksheetToArray(worksheet) {
  if (!worksheet) return [];
  
  let result = [];
  let headers = [];
  let headerRowIndex = null;
  
  // Find the header row (first row with content)
  for (let rowIndex = 0; rowIndex < 100; rowIndex++) {
    let rowData = [];
    let hasContent = false;
    
    for (let colIndex = 0; colIndex < 50; colIndex++) {
      let cellRef = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
      let cell = worksheet[cellRef];
      let value = cell ? cell.v : "";
      
      if (value !== null && value !== undefined && value !== "") {
        hasContent = true;
      }
      rowData.push(value);
    }
    
    if (hasContent) {
      headers = rowData;
      headerRowIndex = rowIndex;
      break;
    }
  }
  
  // Convert remaining rows to objects
  if (headerRowIndex !== null) {
    for (let rowIndex = headerRowIndex + 1; rowIndex < 1000; rowIndex++) {
      let row = {};
      let hasContent = false;
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        let cellRef = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
        let cell = worksheet[cellRef];
        let value = cell ? cell.v : "";
        
        if (value !== null && value !== undefined && value !== "") {
          hasContent = true;
        }
        
        if (headers[colIndex]) {
          row[headers[colIndex]] = value;
        }
      }
      
      if (!hasContent) break;
      result.push(row);
    }
  }
  
  return result;
}

// function to find first row matching criteria
function findRow(table, criteria) {
  for (let i = 0; i < table.length; i++) {
    let row = table[i];
    let matches = true;
    for (let key in criteria) {
      if (row[key] !== criteria[key]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return row;
    }
  }
  return null;
}

function addLink(standard) {
  return "<a href=\"https://webstore.iec.ch/en/iec-search/result?q=" + standard + "\" target=\"_blank\">" + standard + "</a>";
}
