# Multiple Tenant Installer Automation

This serves as documentation for the multiple tenant installer automation included
in this repo.

|                   |                              |
|-------------------|------------------------------|
| Installer version | 1                            |
| Installer file    | multipleTenantInstaller.json |

## The multiple tenant monitoring pattern

The pattern for multiple tenant monitoring has all monitoring configured on a single,
core tenant. This is referred to as a `parent` tenant by the monitoring apps.

This `parent` tenant will have:

- One space which maintains the aggregated logs for all tenants, and the associated
  `parent` monitoring apps. This will be used for normal reporting and usage tracking
  of the aggregated estate.
- N spaces for `child` tenants, one per `child` tenant. These will contain a copy of
  each monitoring app in `child` mode, plus a data connection to the `child` tenant,
  and a copy of QVDs for that tenant. This will be used for enabling incremental loads,
  and for any detailed investigations into usage or issues you might need to take.

The automation will create and maintain one API key for the provided regional OAuth
client user on each `child` tenant. All other assets will remain on the `parent`
tenant. You should never need to interactively login to the `child` tenants.

## Installation

To install the automation:

1. Download the associated JSON file
2. Create a new, blank automation in your Qlik Cloud tenant
3. Right click into the workspace, select `Upload workspace`, and import the JSON
   file you downloaded in step 1.

## Updates

The automation will cease to run and exit with an error if the version stored in the
automation is lesser than the version stored in the installer manifest in this
repository. This is to protect against breaking changes being introduced in our
manifests which break your monitoring app deployment.

To update your automation, simply follow the installation path to create a new
automation to use as your monitoring app installer and ensure the configuration
matches before you hit run.

## Configuration

The automation is designed to be run without user intervention, meaning you can
automate maintenance of your monitoring stack - keeping pace with app updates as
well as recreating data connections and API keys to simplify secret handling.

Before you first run your automation, know you can configure the following:

| Variable               | Default value | Purpose                                                                                                                                                                                               |
|------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sharedSpaceName        | Monitoring    | Parent apps will be deployed to a shared space with this name. Child apps will be deployed to a space of the format "{sharedSpaceName} - {tenantHostname}"                                            |
| addCurrentUserToSpaces | 1             | If 1, adds the user running the installer to any spaces with required roles to deploy the apps.                                                                                                       |
| recreateConnections    | 1             | If 1, will recreate the REST connection and API key for all child tenants, even if the apps do not need to be updated and the connection hasn't been deleted.                                         |
| createSchedule         | 1             | If 1, will create a reload task for all monitoring apps.                                                                                                                                              |
| doReload               | 1             | If 1, will trigger a reload of each app after updating it.                                                                                                                                            |
| glossaryName           | TenantList    | If you wish to use a different glossary name, change it here.                                                                                                                                         |
| setMaxApiKey           | {blank}       | If set to a value (e.g. P365D), it will force overwrite the tenant API key expiry max on every child tenant. If blank, will not make a change.                                                        |
| replaceAllApps         | 0             | If 1, will replace all apps irrespective of whether they are out of date or not.                                                                                                                      |
| autoTenantCleanup      | 0             | If 1, will delete any spaces matching the space naming convention for tenants not in the glossary, as well as data files in the aggregated folder for missing tenants.                                |
| skipToTenantNumber     | 0             | If set to a value greater than 0, will skip that number of tenants when run. Useful for recovering quickly from automation run failures. If glossary terms change, the order of tenants might change. |
