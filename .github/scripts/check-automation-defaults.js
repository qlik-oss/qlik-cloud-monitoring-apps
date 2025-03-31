const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'automations', 'multipleTenantInstaller.json');

let jsonData;
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  jsonData = JSON.parse(fileContent);
} catch (err) {
  console.error(`Failed to read or parse JSON file at ${filePath}: ${err}`);
  process.exit(1);
}

// List of variables to check with their expected default values
const variablesToCheck = [
  { name: "setMaxApiKey", expected: "P30D" },
  { name: "skipToTenantNumber", expected: "0" },
  { name: "recreateConnections", expected: "1" },
  { name: "replaceAllApps", expected: "0" },
  { name: "runOnTenant", expected: "" },
  { name: "addCurrentUserToSpaces", expected: "1" },
  { name: "autoTenantCleanup", expected: "1" },
  { name: "createSchedule", expected: "1" },
  { name: "glossaryName", expected: "TenantList" },
  { name: "doReload", expected: "1" },
  { name: "restConnectorName", expected: "monitoring_apps_REST" },
  { name: "sharedSpaceName", expected: "Monitoring" }
];

const successResults = [];
const failureResults = [];
let hasFailures = false;

// Helper: find a block by its "name" property
function findBlockByName(name) {
  return jsonData.blocks.find(block => block.name === name);
}

// Helper: find the first operation with id "set_value" in a block’s operations
function findSetValueOperation(block) {
  if (!block.operations || !Array.isArray(block.operations)) {
    return null;
  }
  return block.operations.find(op => op.id === "set_value");
}

variablesToCheck.forEach(variable => {
  const block = findBlockByName(variable.name);
  if (!block) {
    failureResults.push(`Variable ${variable.name}: NOT FOUND`);
    hasFailures = true;
    return;
  }
  const op = findSetValueOperation(block);
  let actualValue = "";
  if (op && typeof op.value === 'string') {
    actualValue = op.value.trim();
  }
  if (actualValue === variable.expected) {
    successResults.push(`Variable ${variable.name}: SUCCESS (value: "${actualValue}")`);
  } else {
    failureResults.push(`Variable ${variable.name}: FAILURE - expected "${variable.expected}", found "${actualValue}"`);
    hasFailures = true;
  }
});

let report = "=== Default Values Check Report ===\n";
if (successResults.length > 0) {
  report += "\n-- SUCCESSES --\n" + successResults.join("\n") + "\n";
}
if (failureResults.length > 0) {
  report += "\n-- FAILURES --\n" + failureResults.join("\n") + "\n";
}

console.log(report);
process.exit(hasFailures ? 1 : 0);
