> [!IMPORTANT]
> The [Qlik Cloud Monitoring Apps](https://github.com/qlik-oss/qlik-cloud-monitoring-apps) project is _community supported_.
> Qlik does not support these apps. See below for additional information
> on how to raise issues on this repository to ask for help.

# Qlik Cloud Monitoring Apps

This repository references community-built and community-supported Qlik Sense
applications, which provide visibility of both operational and usage data in Qlik Cloud.

## Applications

These applications can be installed via an interactive Qlik Application Automation [installer](https://community.qlik.com/t5/Official-Support-Articles/Qlik-Cloud-Monitoring-Apps-Workflow-Guide/ta-p/2134140) or manually using the PDF guide in each repository.

Monitoring apps may be designed for single or multiple tenant deployments, and additionally may be compatible with only specific Qlik Cloud subscription types, summarized below.

| Monitoring Application                                                                                                                                                          | Compatible deployment modes    | Compatible subscription types |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|-------------------------------|
| [Access Evaluator](https://github.com/qlik-oss/qlik-cloud-access-evaluator)                                                                                                     | Single tenant                  | User, Capacity                |
| [Answers Analyzer](https://github.com/qlik-oss/qlik-cloud-answers-analyzer)                                                                                                   | Single tenant                  | User, Capacity                |
| [App Analyzer](https://github.com/qlik-oss/qlik-cloud-app-analyzer)                                                                                                             | Single tenant, Multiple tenant | User, Capacity                |
| [Automation Analyzer](https://github.com/qlik-oss/qlik-cloud-automation-analyzer)                                                                                               | Single tenant                  | User, Capacity                |
| [Entitlement Analyzer](https://github.com/qlik-oss/qlik-cloud-entitlement-analyzer)                                                                                             | Single tenant, Multiple tenant | User                          |
| [Reload Analyzer](https://github.com/qlik-oss/qlik-cloud-reload-analyzer)                                                                                                       | Single tenant, Multiple tenant | User, Capacity                |
| [OEM Dashboard](https://github.com/qlik-oss/qlik-cloud-oem-dashboard)                                                                                                           | Multiple tenant                | User                          |

If you are looking for more information on Qlik monitoring apps, including Client-Managed monitoring apps,
please review [this community article](https://community.qlik.com/t5/Official-Support-Articles/The-Qlik-Sense-Monitoring-Applications-for-Cloud-and-On-Premise/ta-p/1822454).

## Support policy

These apps are provided as-is and are not supported by Qlik. Over time, the APIs and
metrics used by the apps may change, so it is advised to monitor each repository
for updates, and to update the apps promptly when new versions are available.

If you have issues while using these apps, support is provided on a best-efforts
basis by contributors to these repositories.

If you have an issue, go to the relevant repository, and:

* Review install guide and FAQs
* Review open and closed issues
* Open a new issue, following the issue template

If you are able to resolve the issue, then close your issue with the resolution,
and if you feel inclined, open a PR with your proposed changes so that we can
consider including the improvement in the next release of the app.

Thank you for your support!
