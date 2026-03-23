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
  { name: "setMaxApiKey", expected: "P90D" },
  { name: "skipToTenantNumber", expected: "0" },
  { name: "recreateConnections", expected: "0" },
  { name: "replaceAllApps", expected: "0" },
  { name: "runOnTenant", expected: null },
  { name: "autoTenantCleanup", expected: "1" },
  { name: "createSchedule", expected: "1" },
  { name: "checkVersions", expected: "1" },
  { name: "glossaryName", expected: "TenantList" },
  { name: "manifestUrl", expected: "https://github.com/qlik-oss/qlik-cloud-monitoring-apps/raw/refs/heads/main/manifests/resources.json" },
  { name: "nextRunDelaySeconds", expected: "21600" },
  { name: "reloadScheduleHour", expected: "00" },
  { name: "doReload", expected: "1" },
  { name: "requiredApiKeyValidity", expected: "14" },
  { name: "restConnectorName", expected: "monitoring_apps_REST" },
  { name: "runMode", expected: "0" },
  { name: "sharedSpaceName", expected: "Monitoring" },
  { name: "qcmamtVersion", expected: "4" },
  { name: "parentTenant", expected: "{$.getCurrentTenantInfo.hostnames[0]}" }
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
  const actualValueRaw = op ? op.value : undefined;
  const actualValue = typeof actualValueRaw === 'string' ? actualValueRaw.trim() : actualValueRaw;
  const expectedValue = variable.expected;

  const isMatch = actualValue === expectedValue;
  if (isMatch) {
    successResults.push(`Variable ${variable.name}: SUCCESS (value: ${JSON.stringify(actualValue)})`);
  } else {
    failureResults.push(
      `Variable ${variable.name}: FAILURE - expected ${JSON.stringify(expectedValue)}, found ${JSON.stringify(actualValue)}`
    );
    hasFailures = true;
  }
});

// Ensure the configuration output block references only real variables.
// This keeps docs/UI output and the installer config block in sync.
const configOutputBlock = findBlockByName('output5');
if (configOutputBlock && Array.isArray(configOutputBlock.inputs) && configOutputBlock.inputs.length > 0) {
  const value = configOutputBlock.inputs[0]?.value;
  if (typeof value === 'string') {
    const referenced = Array.from(value.matchAll(/\$\.(\w+)/g)).map(m => m[1]);
    const uniqueReferenced = [...new Set(referenced)];

    const unknown = uniqueReferenced.filter(varName => !findBlockByName(varName));
    if (unknown.length > 0) {
      failureResults.push(
        `Config output references unknown variables: ${unknown.join(', ')}`
      );
      hasFailures = true;
    }
  }
}

let report = "=== Default Values Check Report ===\n";
if (successResults.length > 0) {
  report += "\n-- SUCCESSES --\n" + successResults.join("\n") + "\n";
}
if (failureResults.length > 0) {
  report += "\n-- FAILURES --\n" + failureResults.join("\n") + "\n";
}

console.log(report);
process.exit(hasFailures ? 1 : 0);
