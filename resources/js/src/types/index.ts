export type InvestigationStatus = 'open' | 'in_progress' | 'review' | 'completed' | 'closed';

export type InvestigationPriority = 'low' | 'medium' | 'high' | 'critical';

export type InvestigationType = 'harassment' | 'discrimination' | 'misconduct' | 'conflict_of_interest' | 'policy_violation' | 'retaliation';

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
}

export type AllegationStatus = 'pending' | 'under_review' | 'substantiated' | 'not_substantiated' | 'unfounded';

export type AllegationCategory = 'harassment' | 'discrimination' | 'misconduct' | 'retaliation' | 'policy_violation';

export type FindingOutcome = 'substantiated' | 'not_substantiated' | 'inconclusive';

export interface Allegation {
    id: string;
    investigationId: string;
    title: string;
    description: string;
    category: AllegationCategory;
    status: AllegationStatus;
    finding?: FindingOutcome;
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
    id: string;
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
