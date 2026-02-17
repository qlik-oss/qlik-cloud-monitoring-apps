# Multiple Tenant Installer Automation

This repository contains an [automation solution to install and maintain Qlik Cloud Monitoring apps](https://github.com/qlik-oss/qlik-cloud-monitoring-apps/blob/main/automations/multipleTenantInstaller.json) across multiple tenants in Qlik Cloud. In this architecture, the **parent tenant** handles all monitoring and aggregated log management, while the **child tenants** are minimally involved – they only host an API key.

> **Note:** The parent tenant does not manage the child tenants. Its role is to monitor them. All configuration, updates, and aggregated reporting occur on the parent side.

---

## Overview

This automation implements a multiple tenant monitoring pattern by:
- **Centralizing Monitoring:**  
  The parent tenant hosts a shared space for aggregated logs and monitoring apps.
- **Minimizing Child Footprint:**  
  Child tenants only have an API key installed, which is used to feed monitoring data back to the parent tenant.
- **Automated API Key Management:**  
  API keys on each child tenant are automatically created and maintained (if `recreateConnections=1`), eliminating the need for interactive logins or manual configuration on each child tenant.

This automation does not install any monitoring for the parent tenant. To do this activity, please use the standard Qlik Cloud monitoring app installer.

For more details on the monitoring apps, please refer to the [Qlik Cloud Monitoring Apps repository](https://github.com/qlik-oss/qlik-cloud-monitoring-apps/blob/main/README.md).

---

## Installation

To install the automation:

1. **Download the Installer:**  
   Download the `multipleTenantInstaller.json` file from this repository.
2. **Create a New Automation:**  
   In your Qlik Cloud tenant, create a new, blank automation.
3. **Upload the Workspace:**  
   Right-click in the workspace, select **Upload workspace**, and import the JSON file you downloaded.
4. **Configure Variables:**  
   Review and set the configuration variables as described in the [Configuration](#configuration) section below.
5. **Run the Automation:**  
   Execute the automation. If a glossary matching `glossaryName` does not exist in the shared space, it will be created and the current tenant’s hostname will be added.

---

## Updates

The automation checks its version against the installer manifest. If the automation’s version is lower than that specified in the manifest, it will exit with an error to prevent breaking changes.

Separately, the automation can optionally skip **app version checks** (see `checkVersions`). This does not bypass the installer version guardrail above.

To update:

- Create a new automation using the updated JSON file.
- Ensure that all configuration variables are correctly set before running the new instance.

---

## Configuration

Before running the automation, review the following configuration variables. They are split into two groups: **Overrides** and **Base Configuration**.

### Overrides

These parameters can significantly impact how the automation runs. Please verify that they are configured correctly.

| **Parameter (Variable Name)**                   | **Description**                                                                                                                                          | **Default Value** |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| **API key expiration override** *(setMaxApiKey)* | Set to a value to reconfigure the child tenant's max API key expiry when the automation runs. Any generated API key will match this value (e.g., "P30D" for 30 days). Leave empty to make no changes. | P30D           |
| **Skip to tenant number** *(skipToTenantNumber)* | Set to 0 for no action, or an integer to start updating from that tenant. Note that if you update the glossary, the tenant order might change.         | 0                 |
| **Recreate connections** *(recreateConnections)* | Set to 0 for no action, or 1 to recreate data connections on run.                                                                                        | 1                 |
| **Replace all apps** *(replaceAllApps)*          | Set to 0 for no action, or 1 to replace all apps irrespective of whether they need an upgrade.                                                           | 0                 |
| **Run only on tenant** *(runOnTenant)*           | Leave empty to run against all tenants, or enter a tenant hostname to run against a single tenant.                                                      | (empty)           |

### Base Configuration

These core settings define the core behavior of the monitoring automation.

| **Parameter (Variable Name)**                                                  | **Description**                                                                                                                                                           | **Default Value**                   |
|--------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Automatic tenant cleanup** *(autoTenantCleanup)*                            | Set to 0 for no action, or 1 to automatically remove any tenants not found in the glossary list. This will delete any spaces matching the template pattern as well as tenant-specific log files. | 1                                   |
| **Create a reload schedule for apps when creating or updating** *(createSchedule)* | Set to 0 for no action, or 1 to recreate the app reload schedule.                                                                                                         | 1                                   |
| **Check for new versions** *(checkVersions)*                                   | Set to 1 to check app versions and upgrade when needed. Set to 0 to skip app version checks (the automation will still run, but may redeploy less predictably depending on other overrides). | 1                             |
| **Glossary name** *(glossaryName)*                                             | Specify the glossary from which to retrieve the tenant list.                                                                                                             | TenantList                          |
| **Manifest URL** *(manifestUrl)*                                               | URL of the resources manifest containing version and configuration details.                                                                                              | https://github.com/qlik-oss/qlik-cloud-monitoring-apps/raw/refs/heads/main/manifests/resources.json |
| **Next run delay (seconds)** *(nextRunDelaySeconds)*                           | Skip a tenant if it was processed recently. The timestamp is stored per tenant in the glossary term's `description` field (UTC epoch seconds).                           | 10800                               |
| **Parent tenant** *(parentTenant)*                                             | Hostname of the parent (monitoring/orchestration) tenant. By default this is set automatically to the current tenant.                                                    | (auto-detected)                     |
| **Reload apps after creating or updating** *(doReload)*                        | Set to 0 for no action, or 1 to trigger an immediate reload of apps after they are created or updated.                                                                     | 1                                   |
| **Reload schedule hour (UTC)** *(reloadScheduleHour)*                           | Hour of the day (UTC) when scheduled reloads should start. The installer will create schedules and can stagger tenant reloads (see Scheduling notes below).              | 00                                  |
| **REST connector name** *(restConnectorName)*                                  | Set the name of the REST connector to deploy in child app spaces.                                                                                                          | monitoring_apps_REST                |
| **Run mode** *(runMode)*                                                       | Set to 1 for interactive (prompts before touching any child tenant to allow you to review configuration) and 0 for automated (no prompts once started). All modes will create the parent space and glossary on the parent tenant.  | 0                |
| **Shared space base name** *(sharedSpaceName)*                                 | Name of the shared space into which parent apps are deployed; child apps will be deployed to a space suffixed with the tenant hostname.                                     | Monitoring                          |
| **Version** *(qcmamtVersion)*                                                  | Version of this installer. It is recommended you do not change this value.                                                                                                | 4                                   |

#### Automatic tenant cleanup

When `autoTenantCleanup` is set to 1, the automation will:

- Delete any spaces which contain `<sharedSpaceName> (`, to remove the REST connection to the child tenant, the apps which load from that connection, and all data files maintained by the apps. This is a match lookup based on the name of the space.
- Delete any tenant specific data files stored in the `<sharedSpaceName>` space.

It will not delete:

- The API key or regional OAuth user from the child tenant (it is assumed this has already been cleaned up via a tenant deactivation) or other process.
- The data for that tenant stored in the aggregated QVDs. This data will be removed the next time the aggregation (parent) apps are reloaded.

#### Run mode

When `runMode` is set to 1, the automation will prompt a user to interactively click a button to proceed with the deployment.

When set to 0, no user intervention is required. This mode is designed for scheduled runs of the automation, which will automate the refresh of data connections, update of apps, and clean up of removed tenants. This is the intended function of the automation.

In normal operation:

- Set `runMode` to 0 to skip the prompt.
- Schedule the automation to run every `5` days.
- Set `setMaxApiKey` to `P30D` to provide an expiry longer than the schedule.
- Ensure that `recreateConnections` remains set to `1` so that it recreates the API key each time the automation runs.

## Scheduling notes

When `createSchedule=1`, schedules are created/updated using the `v1/tasks` API. The legacy `v1/reload-tasks` endpoints are queried for backwards compatibility, but are expected to be removed by Qlik in future.

The schedule timing is generated in a custom code block based on:
- `reloadScheduleHour` (UTC hour to start)
- Tenant iteration order (see Tenant list processing below)

If you need to stagger reloads, adjust the minute increment in the custom code block (look for `MINUTE_INCREMENT`). Parent-tenant apps are intentionally scheduled **10 minutes after** the last child tenant offset.

## Permissions and API key management

Child tenants must allow the automation user to create API keys. The automation checks permissions using `v1/accesscontrol/evaluation`. If the required permission is missing, it will attempt to create a custom role named:

`Qlik Cloud multi-tenant monitoring app deployer v<qcmamtVersion>`

and assign that role to the automation user on the child tenant.

## Tenant list

By default, the automation loads the list of tenants from a glossary named `TenantList` in the `sharedSpaceName` shared space.

### Tenant list processing

- Newly added glossary terms are processed first (sorted by `createdAt`, newest first).
- Any term tagged `parent` is processed last.
- The automation stores a per-tenant "last attempted" timestamp in the glossary term `description` field (UTC epoch seconds) and uses `nextRunDelaySeconds` to avoid reprocessing too frequently.

A glossary is used rather than a direct external source as:

- It makes the automation more portable, since you can create your own automation to update the glossary, and simply use our vanilla installer.
- It allows you to curate your monitoring groups, rather than including all tenants on a license in one bucket, since you may have sub groups for
  production, test, development, etc.

---

## Contributing

Contributions are welcome. If you have suggestions, improvements, or bug fixes, please open an issue or submit a pull request.

When contributing an update to the automation, format (pretty print) it using VS code (or similar) to improve the quality of the diff for review.
