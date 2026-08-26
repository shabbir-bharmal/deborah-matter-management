export type InvestigationStatus = 'open' | 'in_progress' | 'review' | 'completed' | 'closed';

export type InvestigationPriority = 'low' | 'medium' | 'high' | 'critical';

export type InvestigationType =
    | 'harassment'
    | 'discrimination'
    | 'misconduct'
    | 'conflict_of_interest'
    | 'policy_violation'
    | 'retaliation'
    | 'data_privacy'
    | 'theft'
    | 'substance_abuse'
    | 'workplace_violence'
    | 'safety_violation'
    | 'fraud';

export interface Investigation {
    id: string;
    referenceNumber: string;
    title: string;
    client: string;
    type: InvestigationType;
    status: InvestigationStatus;
    priority: InvestigationPriority;
    investigator: string;
    openedAt: string;
    targetCompletionDate: string;
    completedAt?: string;
    description: string;
    /** Slug used by the client portal route. */
    clientSlug?: string;
}

export type AllegationStatus = 'pending' | 'under_review' | 'substantiated' | 'not_substantiated' | 'unfounded';

export type AllegationCategory =
    | 'harassment'
    | 'discrimination'
    | 'misconduct'
    | 'retaliation'
    | 'policy_violation'
    | 'conflict_of_interest'
    | 'data_privacy'
    | 'fraud'
    | 'safety_violation'
    | 'substance_abuse'
    | 'theft'
    | 'workplace_violence';

export type FindingOutcome = 'substantiated' | 'not_substantiated' | 'unsubstantiated' | 'inconclusive';

export interface Allegation {
    id: string;
    investigationId: string;
    title: string;
    description: string;
    category: AllegationCategory;
    status: AllegationStatus;
    finding?: FindingOutcome | null;
    /** Investigator's rationale recorded alongside the finding. */
    findingNotes?: string | null;
    relatedWitnessIds: string[];
    relatedEvidenceIds: string[];
}

export type InterviewStatus = 'not_scheduled' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Witness {
    id: string;
    investigationId: string;
    name: string;
    role: string;
    relationship: 'complainant' | 'respondent' | 'coworker' | 'manager' | 'third_party';
    interviewStatus: InterviewStatus;
    interviewDate?: string;
    notes?: string;
}

export interface Interview {
    id: string;
    investigationId: string;
    witnessId: string;
    scheduledAt: string;
    status: InterviewStatus;
    interviewer: string;
    notes?: string;
    transcriptExcerpt?: string[];
    relatedAllegationIds: string[];
}

export type EvidenceType = 'email' | 'document' | 'chat_log' | 'recording' | 'photo' | 'system_report';

export type EvidenceStatus = 'received' | 'in_review' | 'reviewed' | 'archived';

export interface Evidence {
    id: string;
    investigationId: string;
    title: string;
    type: EvidenceType;
    source: string;
    date: string;
    status: EvidenceStatus;
    description: string;
    metadata: Record<string, string>;
    relatedAllegationIds: string[];
    supportsAllegations: string[];
    contradictsAllegations: string[];
}

export type TimelineEventType = 'intake' | 'meeting' | 'interview' | 'evidence' | 'review' | 'milestone' | 'correspondence';

export interface TimelineEvent {
    id: string;
    investigationId: string;
    date: string;
    type: TimelineEventType;
    title: string;
    description: string;
    relatedEntity?: {
        type: 'witness' | 'interview' | 'evidence' | 'allegation' | 'document';
        id: string;
        label: string;
    };
}

export type DocumentStatus = 'draft' | 'final' | 'shared';

export interface InvestigationDocument {
    id: string;
    investigationId: string;
    name: string;
    type: 'report' | 'plan' | 'correspondence' | 'consent_form' | 'summary';
    status: DocumentStatus;
    createdAt: string;
}

export interface InterviewWithWitness extends Interview {
    witnessName: string;
    witnessRole: string;
}

export interface UpcomingInterviewItem extends InterviewWithWitness {
    investigationReference: string;
    investigationTitle: string;
}

export interface RecentActivityItem {
    event: TimelineEvent;
    investigationReference: string;
    investigationTitle: string;
}

export interface PendingActionItem {
    id: string;
    label: string;
    count: number;
}

export interface DashboardSnapshot {
    activeMatterCount: number;
    completedMatterCount: number;
    overdueMatterCount: number;
    statusCounts: { status: InvestigationStatus; count: number }[];
    priorityCounts: { priority: InvestigationPriority; count: number }[];
    upcomingInterviews: UpcomingInterviewItem[];
    recentActivity: RecentActivityItem[];
    pendingActions: PendingActionItem[];
}

export interface ClientSummary {
    /** Slug — the SPA routes clients by slug. */
    id: string;
    clientId?: number;
    name: string;
    matterCount: number;
    activeCount: number;
}

export interface ClientPortalMatter extends Investigation {
    stageIndex: number;
    upcomingInterviews: InterviewWithWitness[];
    sharedDocuments: InvestigationDocument[];
    latestEvent?: TimelineEvent;
}

export interface ClientPortal {
    id: string;
    name: string;
    matters: ClientPortalMatter[];
}

export type NotificationKind = 'interview' | 'evidence' | 'milestone' | 'report';

export interface AppNotification {
    id: string;
    kind: NotificationKind;
    title: string;
    description: string;
    date: string;
    href: string;
}

export type CalendarEventKind = 'interview' | 'deadline';

export interface CalendarEvent {
    id: string;
    kind: CalendarEventKind;
    date: string;
    time?: string;
    title: string;
    subtitle: string;
    reference: string;
    href: string;
}

export interface MatterNote {
    id: string;
    investigationId: string;
    author: string;
    body: string;
    createdAt: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    clientId: number | null;
    clientSlug: string | null;
    roles: string[];
    /** Flat `module.action` list the UI gates navigation and actions on. */
    permissions: string[];
}

export type ReportStatus = 'draft' | 'final';

export interface ReportCustomSection {
    id: string;
    heading: string;
    bullets: string[];
}

export interface InvestigationReport {
    investigationId: string;
    status: ReportStatus;
    title: string;
    executiveSummary: string;
    includedSections: Record<string, boolean>;
    autoFill: Record<string, string[]>;
    customSections: ReportCustomSection[];
}

export interface RoleSummary {
    id: number;
    name: string;
    permissions: string[];
    userCount: number;
}

export interface RoleMatrix {
    roles: RoleSummary[];
    /** Every ability defined in the system, used as the matrix columns. */
    permissions: string[];
}
