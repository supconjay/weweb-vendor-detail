export default {
  editor: {
    label: { en: "Vendor Detail" },
    icon: "user",
  },
  triggerEvents: [
    // header
    { name: "back", label: { en: "On back click" }, event: {} },
    { name: "sendText", label: { en: "On 'Send A Text'" }, event: { id: "" } },
    { name: "sendEmail", label: { en: "On 'Send An Email'" }, event: { id: "" } },
    { name: "setInactive", label: { en: "On 'Inactive'" }, event: { id: "" } },
    { name: "terminate", label: { en: "On 'Terminate'" }, event: { id: "" } },
    { name: "deleteVendor", label: { en: "On 'Delete'" }, event: { id: "" } },
    { name: "tabChange", label: { en: "On tab change" }, event: { tab: "onboarding" } },
    // onboarding
    { name: "stageClick", label: { en: "On pipeline stage click" }, event: { value: "", label: "", index: 0 } },
    { name: "onboardingItemClick", label: { en: "On onboarding item click" }, event: { index: 0, id: "", item: {} } },
    // details
    { name: "fieldEdit", label: { en: "On detail field save" }, event: { key: "", label: "", value: "", valueLabel: "", type: "", patch: {} } },
    // activity
    { name: "noteSubmit", label: { en: "On note submit" }, event: { text: "", html: "", mentions: [], mentionIds: [], files: [], attachments: [] } },
    { name: "activityItemClick", label: { en: "On activity item click" }, event: { index: 0, id: "", item: {} } },
    { name: "activityDelete", label: { en: "On activity delete" }, event: { index: 0, id: "" } },
    { name: "activityAttachmentClick", label: { en: "On activity attachment click" }, event: { feedIndex: 0, attachmentIndex: 0, url: "", isImage: false, attachment: {} } },
    // inquiries / jobs / payouts
    { name: "newTicket", label: { en: "On 'New Ticket'" }, event: {} },
    { name: "ticketClick", label: { en: "On inquiry row click" }, event: { index: 0, id: "", item: {} } },
    { name: "jobClick", label: { en: "On job view click" }, event: { index: 0, id: "", item: {} } },
    { name: "payoutClick", label: { en: "On payout view click" }, event: { index: 0, id: "", item: {} } },
    // insurance & licensing
    { name: "verifyInsurance", label: { en: "On 'Verify' insurance" }, event: { index: 0, id: "", item: {} } },
    { name: "insuranceClick", label: { en: "On insurance click" }, event: { index: 0, id: "", item: {} } },
    { name: "licenseClick", label: { en: "On license row click" }, event: { index: 0, id: "", item: {} } },
    // user
    { name: "roleChange", label: { en: "On role change" }, event: { value: "", label: "", id: "" } },
    { name: "toggleUserActive", label: { en: "On user active toggle" }, event: { active: false, next: true, value: true, id: "" } },
    { name: "resetPassword", label: { en: "On 'Reset Password'" }, event: {} },
    { name: "sendMagicLink", label: { en: "On 'Send Magic Link'" }, event: {} },
  ],
  properties: {
    // ============ vendor record (header + details) ============
    // Bind a single vendor record (an object) OR a collection — the component
    // reads the first item either way. Typed Array because WeWeb has no "Object"
    // property type.
    vendor: {
      label: { en: "Vendor record (bind)" }, type: "Array", bindable: true, section: "settings",
      defaultValue: [{
        id: "v-demo", name: "1A Test Vendor", nickname: "", email: "jayhelveypro@gmail.com",
        phone: "(470) 776-2124", home_address: "5415 Fieldfreen Dr, Cumming, GA, USA",
        category: "Service Partner", role: "Service Partner", status: "Request",
        primary_skills: ["Carpet Clean", "General Clean", "Licensed Electrical"],
        secondary_skills: ["Blinds", "Cabinets", "Carpentry", "Decks - Deck Repairs"],
        markets: [], lobs: [], terms: "Net 3", how_are_they_scheduled: "", price_guide_verified: "",
        dob: null, date_onboarded: null, ap_email: "", email_used_for_payout: "", notes: "",
      }],
    },
    currentStage: { label: { en: "Current onboarding stage (value/label)" }, type: "Text", defaultValue: "Request", bindable: true },
    activeTab: {
      label: { en: "Active tab" }, type: "TextSelect", bindable: true, defaultValue: "onboarding",
      options: { options: [
        { value: "onboarding", label: { en: "Onboarding" } }, { value: "details", label: { en: "Details" } },
        { value: "activity", label: { en: "Activity" } }, { value: "box", label: { en: "Box" } },
        { value: "inquiries", label: { en: "Inquiries" } }, { value: "jobs", label: { en: "Jobs" } },
        { value: "insurance", label: { en: "Insurance & Licensing" } }, { value: "reviews", label: { en: "Reviews" } },
        { value: "payouts", label: { en: "Payouts" } }, { value: "user", label: { en: "User" } },
      ] },
    },
    tabs: { label: { en: "Tabs override (advanced)" }, type: "Array", bindable: true, defaultValue: [], section: "settings" },

    // ============ onboarding ============
    stages: {
      label: { en: "Pipeline stages" }, type: "Array", bindable: true, section: "settings",
      defaultValue: ["Request", "Potential Provider", "Qualified/Interested", "Document Collection", "Onboarding Meeting", "New", "Active"],
    },
    onboardingItemsTitle: { label: { en: "Onboarding items title" }, type: "Text", defaultValue: "Onboarding Items", bindable: true },
    onboardingItemsSub: { label: { en: "Onboarding items subtitle" }, type: "Text", defaultValue: "Complete the following documents to proceed with the onboarding process.", bindable: true },
    onboardingItems: {
      label: { en: "Onboarding items (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { title: "Onboarding Packet", description: "Complete and sign your onboarding paperwork", status: "Not Submitted" },
        { title: "Trade License", description: "Upload a copy of your valid trade or contractor license", status: "Not Submitted" },
        { title: "Certificate of Insurance", description: "Provide a current certificate of insurance showing general liability coverage", status: "Not Submitted" },
      ],
    },

    // ============ details editing ============
    allowInlineEdit: { label: { en: "Allow inline editing" }, type: "OnOff", defaultValue: true, bindable: true },
    detailFields: { label: { en: "Detail fields override (advanced)" }, type: "Array", bindable: true, defaultValue: [], section: "settings" },
    // How every bound option collection (skills, markets, LOBs, category, terms, …)
    // resolves its display label and its stored value. For Airtable-synced lists the
    // value is usually the airtable_id; switch to "id" if you store the uuid instead.
    optionLabelField: { label: { en: "Option label field" }, type: "Text", defaultValue: "label", bindable: true, section: "settings" },
    optionValueField: { label: { en: "Option value field (stored id)" }, type: "Text", defaultValue: "airtable_id", bindable: true, section: "settings" },
    // option sources for select / tag fields — bind to your collections
    categoryOptions: { label: { en: "Category options (bind)" }, type: "Array", bindable: true, defaultValue: ["Service Partner", "3rd Party Vendor", "Supplier"], section: "settings" },
    skillOptions: { label: { en: "Skill options (bind)" }, type: "Array", bindable: true, defaultValue: ["Carpet Clean", "General Clean", "Licensed Electrical", "Blinds", "Cabinets", "Carpentry", "Decks - Deck Repairs"], section: "settings" },
    marketOptions: { label: { en: "Market options (bind)" }, type: "Array", bindable: true, defaultValue: [], section: "settings" },
    lobOptions: { label: { en: "Line-of-business options (bind)" }, type: "Array", bindable: true, defaultValue: [], section: "settings" },
    termOptions: { label: { en: "Terms options (bind)" }, type: "Array", bindable: true, defaultValue: ["Net 3", "Net 15", "Net 30", "Due on receipt"], section: "settings" },
    scheduleOptions: { label: { en: "Scheduling method options (bind)" }, type: "Array", bindable: true, defaultValue: ["Phone", "Text", "Email", "Portal"], section: "settings" },
    priceGuideOptions: { label: { en: "Price guide options (bind)" }, type: "Array", bindable: true, defaultValue: ["Verified", "Not Verified"], section: "settings" },
    statusOptions: { label: { en: "Status options (bind)" }, type: "Array", bindable: true, defaultValue: ["Request", "Active", "Inactive", "Terminated"], section: "settings" },

    // ============ activity feed ============
    showComposer: { label: { en: "Show note composer" }, type: "OnOff", defaultValue: true, bindable: true },
    composerPlaceholder: { label: { en: "Composer placeholder" }, type: "Text", defaultValue: "Write a note…  type @ to mention someone", bindable: true },
    submitLabel: { label: { en: "Submit button label" }, type: "Text", defaultValue: "Post Note", bindable: true },
    currentUserName: { label: { en: "Current user name (composer avatar)" }, type: "Text", defaultValue: "", bindable: true },
    currentUserAvatar: { label: { en: "Current user avatar (url)" }, type: "Text", defaultValue: "", bindable: true },
    allowAttachments: { label: { en: "Allow attachments on notes" }, type: "OnOff", defaultValue: true, bindable: true },
    attachHint: { label: { en: "Attachment drop hint" }, type: "Text", defaultValue: "Drop your attachment here or click to browse", bindable: true },
    renderHtml: { label: { en: "Render note body as rich text" }, type: "OnOff", defaultValue: true, bindable: true },
    showDelete: { label: { en: "Show activity delete icon" }, type: "OnOff", defaultValue: true, bindable: true },
    deletableActivities: { label: { en: "Deletable activities" }, type: "Array", bindable: true, defaultValue: ["Message", "Note added"], section: "settings" },
    users: {
      label: { en: "Mentionable users (bind)" }, type: "Array", bindable: true, section: "settings",
      defaultValue: [
        { user_auth_id: "auth-u1", name: "Jay Helvey", headshot: "" },
        { user_auth_id: "auth-u2", name: "Joshua Watson", headshot: "" },
      ],
    },
    userLabelField: { label: { en: "User field: name" }, type: "Text", defaultValue: "name", bindable: true, section: "settings" },
    userValueField: { label: { en: "User field: id" }, type: "Text", defaultValue: "user_auth_id", bindable: true, section: "settings" },
    userAvatarField: { label: { en: "User field: avatar" }, type: "Text", defaultValue: "headshot", bindable: true, section: "settings" },
    activityItems: {
      label: { en: "Activity items (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { id: "1", action: "Record created", description: "Vendor profile created", created_at: "2026-06-22T13:43:54+00:00", user_id: { name: "Jay Helvey", headshot: "" }, attachments: [] },
        { id: "2", action: "Note added", description: "Reached out about onboarding packet — awaiting COI.", created_at: "2026-06-21T09:12:00+00:00", user_id: { name: "Joshua Watson", headshot: "" }, attachments: [] },
      ],
    },

    // ============ box ============
    boxEmbedUrl: { label: { en: "Box embed URL" }, type: "Text", defaultValue: "", bindable: true },

    // ============ inquiries ============
    showNewTicket: { label: { en: "Show 'New Ticket' button" }, type: "OnOff", defaultValue: true, bindable: true },
    tickets: {
      label: { en: "Support tickets (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { ticket_number: 1042, subject: "COI expiring soon", category: "Compliance", priority: "High", status: "open", created_at: "2026-07-01T10:00:00+00:00" },
        { ticket_number: 1039, subject: "Payment not received", category: "Billing", priority: "Medium", status: "resolved", created_at: "2026-06-18T15:20:00+00:00" },
      ],
    },

    // ============ jobs ============
    jobs: {
      label: { en: "Jobs / work orders (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { display: "WO#4821 — Carpet Clean", Status: "In Progress", address_string: "112 Oak St, Cumming, GA" },
        { display: "WO#4790 — General Clean", Status: "Complete", address_string: "88 Maple Ave, Alpharetta, GA" },
      ],
    },

    // ============ insurance & licensing ============
    insurances: {
      label: { en: "Insurance policies (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { policy_type: "General Liability", insurer_name: "Acme Insurance Co.", policy_number: "GL-889231", coverage_amount: 1000000, effective_date: "2026-01-01", expiration_date: "2026-12-31", agent_name: "Dana Lee", agent_phone: "(555) 010-2020", status: "pending", document_url: "" },
      ],
    },
    licenses: {
      label: { en: "Licenses (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { license_type: "Electrical Contractor", license_number: "EC-55123", status: "active", expiration_date: "2027-03-15" },
      ],
    },

    // ============ payouts ============
    payouts: {
      label: { en: "Payouts / bills (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { remittance_name: "BILL-2098", Status: "Paid", address: "112 Oak St, Cumming, GA", adjusted_due_date: "2026-06-30", amount: 1250.00 },
        { remittance_name: "BILL-2071", Status: "Pending", address: "88 Maple Ave, Alpharetta, GA", adjusted_due_date: "2026-07-20", amount: 480.50 },
      ],
    },
    currency: { label: { en: "Currency" }, type: "Text", defaultValue: "USD", bindable: true, section: "settings" },

    // ============ user management ============
    user: {
      label: { en: "User record (bind)" }, type: "Array", bindable: true,
      defaultValue: [{ name: "A Christian Construction LLC", email: "chaddangar24@yahoo.com", phone: "(678) 977-1699", status: "Active", role: "3rd Party Vendor", last_login: "2023-10-24T10:45:00" }],
    },
    roleOptions: {
      label: { en: "Role options (bind collection)" }, type: "Array", bindable: true,
      defaultValue: [
        { label: "3rd Party Vendor", value: "3rd Party Vendor" },
        { label: "Service Partner", value: "Service Partner" },
        { label: "Admin", value: "Admin" },
      ],
    },
    roleLabelField: { label: { en: "Role field: label" }, type: "Text", defaultValue: "label", bindable: true, section: "settings" },
    roleValueField: { label: { en: "Role field: value" }, type: "Text", defaultValue: "value", bindable: true, section: "settings" },

    // ============ theming ============
    primaryColor: { label: { en: "Primary color" }, type: "Color", defaultValue: "#2563eb", bindable: true },
    accentColor: { label: { en: "Accent color" }, type: "Color", defaultValue: "#6366f1", bindable: true },
    darkMode: {
      label: { en: "Theme mode" }, type: "TextSelect",
      options: { options: [
        { value: "auto", label: { en: "Auto (system)" } }, { value: "light", label: { en: "Light" } }, { value: "dark", label: { en: "Dark" } },
      ] }, defaultValue: "auto", bindable: true,
    },
    radius: { label: { en: "Corner radius (px)" }, type: "Number", options: { min: 0, max: 32, step: 1 }, defaultValue: 14, bindable: true },
  },
};
