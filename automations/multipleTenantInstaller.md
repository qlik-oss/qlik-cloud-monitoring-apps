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

The automation checks its version against the installer manifest. If the automation’s version is lower than that specified in the manifest, it will exit with an error to prevent breaking changes. To update:

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
| **Run only on tenant** *(runOnTenant)*           | Leave empty to run against all tenants, or enter a tenant hostname to run against a single tenant.                                                      | 0                 |

### Base Configuration

These core settings define the core behavior of the monitoring automation.

| **Parameter (Variable Name)**                                                  | **Description**                                                                                                                                                           | **Default Value**                   |
|--------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Add current user to spaces** *(addCurrentUserToSpaces)*                     | Set to 0 for no action, or 1 to add the user running the automation to spaces with full access.                                                                           | 1                                   |
| **Automatic tenant cleanup** *(autoTenantCleanup)*                            | Set to 0 for no action, or 1 to automatically remove any tenants not found in the glossary list. This will delete any spaces matching the template pattern as well as tenant-specific log files. | 1                                   |
| **Create a reload schedule for apps when creating or updating** *(createSchedule)* | Set to 0 for no action, or 1 to recreate the app reload schedule.                                                                                                         | 1                                   |
| **Glossary name** *(glossaryName)*                                             | Specify the glossary from which to retrieve the tenant list.                                                                                                             | TenantList                          |
| **Manifest URL** *(manifestURL)*                                               | URL of the installer manifest containing version and configuration details.                                                                                              | (Provide your manifest URL)         |
| **Parent tenant**                                                              | Specify the hostname of the parent tenant that hosts the monitoring apps.                                                                                                  | (Provide your parent tenant)        |
| **Reload apps after creating or updating** *(doReload)*                        | Set to 0 for no action, or 1 to trigger an immediate reload of apps after they are created or updated.                                                                     | 1                                   |
| **REST connector name** *(restConnectorName)*                                  | Set the name of the REST connector to deploy in child app spaces.                                                                                                          | monitoring_apps_REST                |
| **Run mode** *(runMode)*                                                       | Set to 1 for interactive (prompts before touching any child tenant to allow you to review configuration) and 0 for automated (no prompts once started). All modes will create the parent space and glossary on the parent tenant.  | 1                |
| **Shared space base name** *(sharedSpaceName)*                                 | Name of the shared space into which parent apps are deployed; child apps will be deployed to a space suffixed with the tenant hostname.                                     | Monitoring                          |
| **Subscription type**                                                          | Define the subscription type used for the monitoring setup.                                                                                                              | (Specify your subscription type)    |
| **Tenant count**                                                               | Specify the total number of child tenants to be monitored.                                                                                                               | (Provide the tenant count)          |
| **Version**                                                                    | Specify the version of the automation installer.                                                                                                                         | (Provide the version)               |

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

## Tenant list

By default, the automation loads the list of tenants from a glossary named `TenantList` in the `sharedSpaceName` shared space.

A glossary is used rather than a direct external source as:

- It makes the automation more portable, since you can create your own automation to update the glossary, and simply use our vanilla installer.
- It allows you to curate your monitoring groups, rather than including all tenants on a license in one bucket, since you may have sub groups for
  production, test, development, etc.

---

## Contributing

Contributions are welcome. If you have suggestions, improvements, or bug fixes, please open an issue or submit a pull request.

When contributing an update to the automation, format (pretty print) it using VS code (or similar) to improve the quality of the diff for review.
