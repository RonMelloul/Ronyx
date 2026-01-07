// Optimized Constants and Configuration
export const ICONS = {
    check: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    minus: "M18 12.75H6a.75.75 0 010-1.5h12a.75.75 0 010 1.5z",
    plus: "M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z",
    project: "M2.25 21h19.5a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H16.5a2.25 2.25 0 01-2.25-2.25V2.25a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25V5.25a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 000 9.75v9A2.25 2.25 0 002.25 21z",
    building: "M3.75 21h16.5a1.5 1.5 0 001.5-1.5v-13.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5zM8.25 18.75a.75.75 0 00.75-.75v-3a.75.75 0 00-1.5 0v3a.75.75 0 00.75.75zM12 18.75a.75.75 0 00.75-.75v-3a.75.75 0 00-1.5 0v3a.75.75 0 00.75.75zM15.75 18.75a.75.75 0 00.75-.75v-3a.75.75 0 00-1.5 0v3a.75.75 0 00.75.75z",
    unit: "M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 9.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 14.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 18.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z",
    owner: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.499-1.632z",
    history: "M12 6.042A8.967 8.967 0 003 15a8.967 8.967 0 009 8.958v-2.006A6.967 6.967 0 016 15a6.967 6.967 0 016-6.958v-2.006z",
    sort: "M3 4.5h14.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h14.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h14.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5z",
    sortAsc: "M3 4.5h14.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h10.5a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h6.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5z",
    sortDesc: "M3 4.5h6.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h10.5a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm0 4.5h14.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5z",
    search: "M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773z",
    xMark: "M6 18L18 6M6 6l12 12",
    filter: "M3 4.5h18a.75.75 0 010 1.5H3a.75.75 0 010-1.5zm3 4.5h12a.75.75 0 010 1.5H6a.75.75 0 010-1.5zm3 4.5h6a.75.75 0 010 1.5H9a.75.75 0 010-1.5z",
    chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    document: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
    edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z",
    clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    columns: "M9 4.5v15m6-15v15M3 12h18",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    sun: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z",
    moon: "M12 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3zm-3.863.863a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM5.25 9a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 015.25 9zm.863 3.863a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM12 21a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0112 21zm3.863-.863a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM18.75 9a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm-.863-3.863a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM12 18a6 6 0 100-12 6 6 0 000 12z",
    balance: "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.05 48.05 0 0012 4.5c-2.291 0-4.545.16-6.75.47v15.086A47.995 47.995 0 0112 19.5c2.291 0 4.545.16 6.75.47V4.97z",
    upload: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
    arrowLeft: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
    download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
    import: "M12 3v4.5m0 0V21m0-13.5L7.5 12m4.5-4.5l4.5 4.5",
    timeline: "M17.25 6.75h-10.5m0 4.5h10.5m-10.5 4.5h10.5M3 18.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75z",
    notification: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    assignment: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
    arrowsRightLeft: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    strategy: "M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75zM12 9v6m-3-3h6",
    loading: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    chevronLeft: "M15 19l-7-7 7-7",
    chevronRight: "M9 5l7 7-7 7",
    more: "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12a.75.75 0 110-1.5.75.75 0 010 1.5zM12 17.25a.75.75 0 110-1.5.75.75 0 010 1.5z"
};

export const STATUS_MAP = {
    V: { text: "חתום", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", icon: ICONS.check },
    X: { text: "לא חתום", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", icon: ICONS.warning },
    ok: { text: "תקין", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", icon: ICONS.check },
    missing: { text: "חסר", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", icon: ICONS.warning },
    exists: { text: "קיים", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300", icon: ICONS.check },
    unknown: { text: "לא ידוע", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", icon: ICONS.warning },
    na: { text: "ל/ר", color: "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400" },
    none: { text: "ללא", color: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300" },
    owner: { text: 'בעלים', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
    vacant: { text: 'פנוי', color: 'bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200' },
    'on-track': { text: 'במסגרת', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    approved: { text: 'מאושר', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    failing: { text: 'לא עומד', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    invalid: { text: 'לא רלוונטי', color: 'bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200' },
    'not-started': { text: 'טרם החל', color: 'bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200' },
    pending: { text: 'בטיפול', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    signed: { text: 'חתום', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    rejected: { text: 'סורב/נדחה', color: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    phone: { text: 'טלפון', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    email: { text: 'אימייל', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    whatsapp: { text: 'Whatsapp', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' },
    tenant: { text: 'שוכר', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
    'not-selling': { text: 'לא למכירה', color: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300' },
    'in-process': { text: 'בתהליך', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    sold: { text: 'נמכר', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    completed: { text: 'הושלם', color: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'in-progress': { text: 'בתהליך', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    licensing: { text: 'רישוי', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' },
};

// Optimized Column Configurations
export const COLUMN_CONFIGS = {
    owner: [
        {
            visible: true,
            columns: [
                { key: 'name', label: 'שם', type: 'text', visible: true, editable: true },
                { key: 'idNumber', label: 'ת.ז.', type: 'text', visible: true, editable: true },
                { key: 'signatureStatus', label: 'סטטוס חתימה', type: 'status', visible: true, editable: true },
                { key: 'contact.phone', label: 'טלפון', type: 'text', visible: false, editable: true },
                { key: 'contact.email', label: 'אימייל', type: 'text', visible: false, editable: true },
                { key: 'socio.profile', label: 'פרופיל', type: 'select', visible: false, editable: true },
                { key: 'sellingStatus', label: 'סטטוס מכירה', type: 'status', visible: false, editable: true },
                { key: 'buyingStatus', label: 'סטטוס רכישה', type: 'status', visible: false, editable: true }
            ]
        }
    ],
    unit: [
        {
            visible: true,
            columns: [
                { key: 'identification.fullAddress', label: 'כתובת', type: 'text', visible: true, editable: false },
                { key: 'physical.areaSqM_net', label: 'שטח נטו', type: 'number', visible: true, editable: true },
                { key: 'physical.numRooms', label: 'חדרים', type: 'number', visible: true, editable: true },
                { key: 'physical.floor', label: 'קומה', type: 'number', visible: true, editable: true },
                { key: 'legal.liens', label: 'שעבודים', type: 'status', visible: true, editable: true },
                { key: 'status.compensationAgreementStatus', label: 'הסכם פיצוי', type: 'status', visible: true, editable: true },
                { key: 'ownerCount', label: 'מספר בעלים', type: 'number', visible: false, editable: false },
                { key: 'signingStatus', label: 'התקדמות חתימות', type: 'progress', visible: false, editable: false },
                { key: 'documentsStatus', label: 'מצב מסמכים', type: 'progress', visible: false, editable: false }
            ]
        }
    ],
    building: [
        {
            visible: true,
            columns: [
                { key: 'name', label: 'שם', type: 'text', visible: true, editable: true },
                { key: 'unitCount', label: 'יחידות', type: 'number', visible: true, editable: false },
                { key: 'physicalCharacteristics.age', label: 'גיל', type: 'number', visible: true, editable: true },
                { key: 'physicalCharacteristics.numFloors', label: 'קומות', type: 'number', visible: true, editable: true },
                { key: 'specialMajorityStatus', label: 'רוב מיוחד', type: 'status', visible: true, editable: false },
                { key: 'signingProgress', label: 'התקדמות חתימות', type: 'progress', visible: true, editable: false },
                { key: 'commonPropertyProgress', label: 'רכוש משותף', type: 'progress', visible: false, editable: false },
                { key: 'financialIssuesCount', label: 'בעיות פיננסיות', type: 'number', visible: false, editable: false }
            ]
        }
    ],
    project: [
        {
            visible: true,
            columns: [
                { key: 'projectName', label: 'שם פרויקט', type: 'text', visible: true, editable: true },
                { key: 'projectType', label: 'סוג פרויקט', type: 'text', visible: true, editable: true },
                { key: 'location.address', label: 'כתובת', type: 'text', visible: true, editable: true },
                { key: 'totalUnits', label: 'סך יחידות', type: 'number', visible: true, editable: false },
                { key: 'totalOwners', label: 'סך בעלים', type: 'number', visible: true, editable: false },
                { key: 'overallSpecialMajorityStatus', label: 'רוב מיוחד כללי', type: 'status', visible: true, editable: false },
                { key: 'overallSigningProgress', label: 'התקדמות כללית', type: 'progress', visible: true, editable: false }
            ]
        }
    ]
};

// Configuration constants
export const APP_CONFIG = {
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 100,
        PAGE_SIZE_OPTIONS: [50, 100, 250, 500, 1000]
    },
    SEARCH: {
        DEBOUNCE_DELAY: 300,
        MIN_SEARCH_LENGTH: 2
    },
    NOTIFICATIONS: {
        AUTO_HIDE_DELAY: 5000,
        MAX_NOTIFICATIONS: 5
    },
    VIRTUAL_SCROLL: {
        THRESHOLD: 500,
        ITEM_HEIGHT: 50
    },
    PERFORMANCE: {
        ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
        RENDER_TIME_THRESHOLD: 16 // 60fps threshold
    }
};

// Export status map for easy importing
export const statusMap = STATUS_MAP;