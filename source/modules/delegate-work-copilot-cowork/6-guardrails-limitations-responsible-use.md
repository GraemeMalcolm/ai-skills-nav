---
title: Understand Cowork guardrails and limitations
description: Understand how Cowork operates within Microsoft 365 security boundaries, known limitations, and what to expect.
---

::: zone pivot="Video"
 
[!VIDEO https://learn-video.azurefd.net/vod/player?id=52e40957-4130-43be-9d3f-25fd20a7ad50]
 
::: zone-end
 
::: zone pivot="Text"

When you delegate work to an AI tool like Cowork, it helps to understand how that work is managed and where the boundaries are. This unit covers the security model that applies to Cowork and the known limitations to keep in mind as you work.

## Security and permissions

Cowork operates inside the same security boundaries as the rest of Microsoft Copilot. It doesn't get separate or broader access to your organization's data.

- **Your identity** - Cowork acts as you, using your Microsoft Entra ID sign-in and your access scope.
- **Your permissions** - Cowork can only access data and services that your Microsoft 365 account is authorized to use. If you can't see a file, neither can Cowork. Sensitivity labels and data loss prevention (DLP) policies apply to all Cowork interactions.
- **Tenant isolation** - Your data is isolated to your organization's tenant. Cowork can't access data from other tenants.
- **No model training on your data** - Cowork doesn't use your organizational data to train AI models. Your data remains within Microsoft 365 and is subject to your organization's existing data governance policies.

## Known limitations

Cowork is a capable tool, but it has boundaries you should be aware of:

- **Ambiguous instructions.** Cowork may misinterpret vague or overly broad requests. Provide clear, specific instructions for better results.
- **AI-generated content is a starting point.** Documents, emails, and messages that Cowork creates should be treated as drafts. Always review before approving send or share actions.
- **No local file access.** Cowork can't access files stored on your local device. It works with files in OneDrive, SharePoint, and other connected cloud services.
- **No file deletion.** Cowork can't delete files or folders in OneDrive or SharePoint.
- **Results may be incomplete.** Search results depend on what's indexed across your organization. If source data is outdated or not indexed, Cowork may not find it.
- **Complex tasks may not fully complete.** Multi-step tasks with many dependencies may not always finish as expected. Review results carefully.
- **Custom skills aren't validated by Microsoft.** If you or your organization create custom skills, their quality depends on how they were written. Review their outputs carefully.
- **Plugin skills are third-party.** Plugin skills and connectors are provided by third-party publishers. Review their outputs carefully, as quality depends on the publisher.
- **Voice input varies by browser.** Not all browsers support voice input for Cowork.

> **NOTE**: Cowork isn't intended for use cases that require guaranteed accuracy without human review, such as legal filings, medical decisions, or financial transactions that bypass approval processes.

## Three things to remember

- **Cowork sees what you see** - your identity, permissions, and tenant isolation apply at all times.
- **Cowork doesn't take sensitive actions without you** - sending, sharing, and scheduling actions wait for your approval.
- **Cowork doesn't train on your data** - your organizational data stays within Microsoft 365 and your existing governance policies.

::: zone-end

> **NOTE**: We recognize that different people like to learn in different ways. You can choose to complete this module in video-based format or you can read the content as text and images. The text contains greater detail than the videos, so in some cases you might want to refer to it as supplemental material to the video presentation.
