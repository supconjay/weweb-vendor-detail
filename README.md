# Vendor Detail — WeWeb coded section

A single [WeWeb](https://www.weweb.io/) coded **section** that renders a full vendor
detail page with a header and ten tabs. Built with the `pp-`/`vd-` design system
(CSS-variable theming, light/dark/auto), fully data-bindable, and self-contained.

## Tabs

| Tab | Purpose |
| --- | --- |
| **Onboarding** | Clickable status pipeline + onboarding-items checklist |
| **Details** | Inline-editable vendor fields (text, date, single-select, tag/multi-select) |
| **Activity** | Note composer with @mentions + attachments, and an activity feed |
| **Box** | Embedded Box folder (iframe from a URL) |
| **Inquiries** | Support-ticket table |
| **Jobs** | Work-order table with a View action |
| **Insurance & Licensing** | Insurance card grid (Verify + View) and a licensing table |
| **Reviews** | Coming-soon placeholder |
| **Payouts** | Bills table with a View action |
| **User** | User access management — role select, active toggle, reset password, magic link |

The header shows the vendor avatar/name/status, a contact row, and an actions menu
(Send Text, Send Email, Inactive, Terminate, Delete) beside the back button.

## Develop

```bash
npm i
npm run serve   # then add the local section via the WeWeb editor developer popup
```

## Build

```bash
npx weweb build --name=vendor-detail --type=section
```

## Data binding (ww-config properties)

- **Vendor record** / **User record** — bind a single Supabase record *or* a
  collection; the component reads the first item. Typed as `Array` because WeWeb
  has no `Object` property type.
- **Collections** — `onboardingItems`, `activityItems`, `tickets`, `jobs`,
  `insurances`, `licenses`, `payouts`, `roleOptions`, and the Details option
  sources (`categoryOptions`, `skillOptions`, `marketOptions`, `lobOptions`,
  `termOptions`, `scheduleOptions`, `priceGuideOptions`).
- **Box** — `boxEmbedUrl`.

All bindable props accept an array or a WeWeb collection (`{ data: [...] }`).

## Events (bind to workflows)

`fieldEdit` (carries a `patch` keyed by column name), `stageClick`,
`onboardingItemClick`, `noteSubmit`, `activityItemClick`, `activityDelete`,
`ticketClick`, `newTicket`, `jobClick`, `verifyInsurance`, `insuranceClick`,
`licenseClick`, `payoutClick`, `roleChange`, `toggleUserActive`, `resetPassword`,
`sendMagicLink`, `sendText`, `sendEmail`, `setInactive`, `terminate`,
`deleteVendor`, `tabChange`, `back`.

> Events are suppressed while editing in the WeWeb canvas — use **Preview** to test
> event-driven workflows.
