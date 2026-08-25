/**
 * Single source of truth for all static UI text: brand, navigation, page copy,
 * workspace tabs, and shared labels. Components must import their text from
 * here instead of hard-coding strings.
 */

export const BRAND = {
    name: 'Investigation Management',
    sidebarNote: 'Prototype — mock data only',
} as const;

export const FOOTER = {
    tagline: 'Workplace investigation management for modern teams.',
    navigateHeading: 'Navigate',
    contactHeading: 'Contact',
    contactEmail: 'compliance@prototype.local',
    confidentiality: 'Confidential — for authorised investigators only.',
    rights: 'All rights reserved.',
} as const;

export interface NavItemData {
    label: string;
    href: string;
    end?: boolean;
}

export const NAV_ITEMS: NavItemData[] = [
    { label: 'Dashboard', href: '/', end: true },
    { label: 'Investigations', href: '/investigations' },
    { label: 'Clients', href: '/clients' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Display Calendar', href: '/display-calendar' },
    { label: 'Settings', href: '/settings' },
];

export const ARIA_LABELS = {
    openMenu: 'Open navigation menu',
    goToDashboard: 'Go to dashboard',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    unreadBadge: 'Unread',
} as const;

export const WORKSPACE_TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'findings', label: 'Findings' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'reports', label: 'Reports' },
    { id: 'notes', label: 'Notes' },
] as const;

export const COMMON = {
    backToAllMatters: 'All matters',
    backToClients: 'All clients',
    markAllRead: 'Mark all read',
    notifications: 'Notifications',
    allCaughtUp: "You're all caught up.",
    printPdf: 'Print / PDF',
    signOut: 'Sign out',
    signOutDisabledTitle: 'Sign-out is disabled in the prototype',
    signOutDisabledDescription: 'No authentication in this phase.',
    profileAndPreferences: 'Profile & preferences',
    settingsLabel: 'Settings',
    loading: 'Loading…',
    none: 'None',
} as const;

export const PROFILE = {
    name: 'Deborah Whitfield',
    role: 'Lead Investigator',
    email: 'deborah.whitfield@prototype.local',
} as const;

export const PAGE_TEXT = {
    pagination: {
        rowsPerPage: 'Per page',
        showing: 'Showing',
        of: 'of',
        previous: 'Previous page',
        next: 'Next page',
    },
    dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of active investigations and upcoming work.',
        quickLinks: 'All matters',
        stats: {
            activeMatters: 'Active matters',
            completedClosed: 'Completed / closed',
            pastTargetDate: 'Past target date',
        },
        cards: {
            byStatus: 'Matters by status',
            byStatusDescription: 'All investigations in the system.',
            byPriority: 'Active matters by priority',
            byPriorityDescription: 'Open, in progress, and in review.',
            pendingActions: 'Pending actions',
            upcomingInterviews: 'Upcoming interviews',
            upcomingInterviewsDescription: 'Scheduled and rescheduled across active matters.',
            noUpcomingInterviews: 'No upcoming interviews scheduled.',
            recentActivity: 'Recent activity',
            recentActivityDescription: 'Latest events across all matters.',
            statusSummary: 'Status summary',
        },
    },
    investigations: {
        title: 'Investigations',
        subtitle: 'All matters — active and completed.',
        searchPlaceholder: 'Search reference, title, client…',
        filters: {
            all: 'All Matters',
            active: 'Active',
            completed: 'Completed',
        },
        empty: 'No matters match your search or filter.',
        rowLabels: {
            investigator: 'Investigator:',
            opened: 'Opened',
            target: 'Target',
        },
    },
    clients: {
        title: 'Clients',
        subtitle: 'Client organizations — open a client to see their portal view.',
        empty: 'No clients recorded.',
        portalBadge: 'Portal view',
    },
    clientPortal: {
        badge: 'Client portal concept',
        intro: 'What the client would see: matter status, milestones, upcoming steps, and client-visible documents only.',
        sections: {
            upcomingSteps: 'Upcoming steps',
            noUpcomingSteps: 'No upcoming steps scheduled.',
            latestUpdate: 'Latest update',
            sharedDocuments: 'Client-visible documents',
            noSharedDocuments: 'No documents shared yet.',
        },
        milestones: ['Intake', 'Planning', 'Fieldwork', 'Findings & report', 'Completed'],
        notFound: 'Client not found.',
    },
    calendar: {
        title: 'Calendar',
        subtitle: 'Upcoming interviews and matter deadlines.',
        interviewsCard: {
            title: 'Upcoming interviews',
            description: 'Scheduled and rescheduled across active matters.',
            empty: 'No upcoming interviews scheduled.',
        },
        deadlinesCard: {
            title: 'Matter deadlines',
            description: 'Active matters by target completion date.',
            pastDue: 'Past due',
        },
    },
    displayCalendar: {
        title: 'Display Calendar',
        subtitle: 'Month view of all upcoming interviews and matter deadlines across every active matter.',
        today: 'Today',
        legend: {
            interview: 'Interview',
            deadline: 'Matter deadline',
        },
        selectedDay: 'Events on',
        noSelection: 'Select a highlighted day to see its events.',
        noEvents: 'No events on this day.',
        more: 'more',
        upcomingTitle: 'All upcoming events',
        upcomingDescription: 'Interviews and matter deadlines, soonest first.',
        filterLabel: 'Show',
        filterAll: 'All',
        empty: 'No interviews or deadlines to display.',
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    settings: {
        title: 'Settings',
        subtitle: 'Prototype preferences.',
        appearance: {
            title: 'Appearance',
            description: 'Choose light or dark styling for the prototype.',
            light: 'Light',
            dark: 'Dark',
            note: 'Preference is stored in this browser only (mock persistence).',
        },
    },
    notFound: {
        title: 'Page not found',
        subtitle: 'The page you are looking for does not exist in the prototype.',
        backToDashboard: 'Back to dashboard',
    },
    workspace: {
        notFound: 'Matter not found.',
        overview: {
            title: 'Overview',
            description: 'Client and investigation details.',
            fields: {
                client: 'Client',
                type: 'Type',
                investigator: 'Investigator',
                opened: 'Opened',
                targetCompletion: 'Target completion',
                completed: 'Completed',
            },
            allegationsSummaryTitle: 'Allegations',
            witnessesSummaryTitle: 'Witnesses',
        },
        timeline: {
            title: 'Timeline',
            description: 'Chronological events for this matter. Select an event to inspect it.',
            empty: 'No events recorded yet.',
        },
        allegations: {
            empty: 'No allegations recorded.',
            relatedWitnesses: 'Related witnesses',
            relatedEvidence: 'Related evidence',
            reviewFinding: 'Review finding in Findings tab →',
            findingPrefix: 'Finding:',
        },
        witnesses: {
            empty: 'No witnesses recorded.',
            interviewDate: 'Interview date:',
            notes: 'Notes',
            relatedAllegations: 'Related allegations',
        },
        interviews: {
            empty: 'No interviews recorded.',
            status: 'Status',
            interviewer: 'Interviewer',
            notes: 'Notes',
            transcriptExcerpt: 'Transcript excerpt',
            relatedAllegations: 'Related allegations',
        },
        evidence: {
            empty: 'No evidence recorded.',
            staticPreviewNote: 'Static preview — file rendering is out of scope for the prototype.',
            metadata: 'Metadata',
            reviewStatus: 'Review status',
            relatedAllegations: 'Related allegations',
        },
        findings: {
            supporting: 'Supporting evidence',
            contradicting: 'Contradicting evidence',
            finding: 'Finding',
            clearOverride: 'Clear override',
            notes: 'Investigator notes',
            notesPlaceholder: 'Record the reasoning behind the finding…',
            sessionNote: 'Finding selections and notes are held in mock state for this browser session.',
            empty: 'No allegations to review.',
        },
        documents: {
            empty: 'No documents recorded.',
            created: 'Created',
        },
        notes: {
            title: 'Notes',
            description: 'Administrative notes about this matter.',
            addHeading: 'Add a note',
            placeholder: 'Record an administrative note about this matter…',
            add: 'Add note',
            empty: 'No notes recorded for this matter yet.',
            delete: 'Delete note',
            sessionNote: 'Notes are held in mock state for this browser session.',
        },
        reports: {
            draft: 'Draft',
            final: 'Final',
            customizeHint: 'Customize the report; the preview updates live.',
            finalViewHint: 'Mock final report view.',
            previewFinalView: 'Preview final view',
            backToEditor: 'Back to editor',
            markAsFinal: 'Mark as final',
            markedFinalToast: 'Report marked as final',
            markedFinalToastDescription: 'customization is now locked.',
            confirmTitle: 'Mark report as final?',
            confirmDescription: 'This locks the report structure and customization for',
            confirmIrreversible: '. The mock action cannot be undone in this session.',
            cancel: 'Cancel',
            customizePanel: 'Customize report',
            locked: 'Locked',
            reportTitle: 'Report title',
            executiveSummary: 'Executive summary',
            executiveSummaryPlaceholder: 'Optional summary shown before section 1…',
            sections: 'Sections',
            sessionNote: 'Customizations are held in mock state for this session.',
            assembling: 'Assembling report…',
            noSections: 'No sections selected — include at least one section.',
            footer: 'Mock report generated by the prototype — no real documents are produced or stored.',
            coverDraft: 'Investigation report — draft preview',
            coverFinal: 'Final investigation report',
            issued: 'Issued',
        },
    },
    aiAssistant: {
        button: 'AI Assistant',
        title: 'Matter assistant',
        conceptBadge: 'Concept',
        predefinedPrompts: 'Predefined prompts',
        prompts: {
            summarize: 'Summarize this matter',
            openAllegations: 'Which allegations are still open?',
            supportingEvidence: 'What supports the substantiated findings?',
            nextInterviewQuestions: 'Questions for the next interview',
            outstandingActions: 'Outstanding actions',
        },
    },
} as const;
