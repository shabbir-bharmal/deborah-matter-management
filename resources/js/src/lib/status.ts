import type {
    AllegationCategory,
    AllegationStatus,
    Evidence,
    EvidenceStatus,
    FindingOutcome,
    InterviewStatus,
    InvestigationDocument,
    InvestigationPriority,
    InvestigationStatus,
    InvestigationType,
    Witness,
} from '~/types';

export const investigationTypeLabels: Record<InvestigationType, string> = {
    harassment: 'Harassment',
    discrimination: 'Discrimination',
    misconduct: 'Misconduct',
    conflict_of_interest: 'Conflict of Interest',
    policy_violation: 'Policy Violation',
    retaliation: 'Retaliation',
    data_privacy: 'Data Privacy',
    fraud: 'Fraud',
    safety_violation: 'Safety Violation',
    substance_abuse: 'Substance Abuse',
    theft: 'Theft',
    workplace_violence: 'Workplace Violence',
};

export const investigationStatusLabels: Record<InvestigationStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    review: 'In Review',
    completed: 'Completed',
    closed: 'Closed',
};

export const investigationStatusBadgeClass: Record<InvestigationStatus, string> = {
    open: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    closed: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

export const priorityLabels: Record<InvestigationPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
};

export const priorityBadgeClass: Record<InvestigationPriority, string> = {
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export const interviewStatusLabels: Record<InterviewStatus, string> = {
    not_scheduled: 'Not Scheduled',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rescheduled: 'Rescheduled',
};

export const allegationStatusLabels: Record<AllegationStatus, string> = {
    pending: 'Pending',
    under_review: 'Under Review',
    substantiated: 'Substantiated',
    not_substantiated: 'Not Substantiated',
    unfounded: 'Unfounded',
};

export const evidenceStatusLabels: Record<EvidenceStatus, string> = {
    received: 'Received',
    in_review: 'In Review',
    reviewed: 'Reviewed',
    archived: 'Archived',
};

export const evidenceTypeLabels: Record<Evidence['type'], string> = {
    email: 'Email',
    document: 'Document',
    chat_log: 'Chat Log',
    recording: 'Recording',
    photo: 'Photo',
    system_report: 'System Report',
};

export const evidenceStatusBadgeClass: Record<EvidenceStatus, string> = {
    received: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    in_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    reviewed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    archived: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

export const allegationCategoryLabels: Record<AllegationCategory, string> = {
    harassment: 'Harassment',
    discrimination: 'Discrimination',
    misconduct: 'Misconduct',
    retaliation: 'Retaliation',
    policy_violation: 'Policy Violation',
    conflict_of_interest: 'Conflict of Interest',
    data_privacy: 'Data Privacy',
    fraud: 'Fraud',
    safety_violation: 'Safety Violation',
    substance_abuse: 'Substance Abuse',
    theft: 'Theft',
    workplace_violence: 'Workplace Violence',
};

export const allegationStatusBadgeClass: Record<AllegationStatus, string> = {
    pending: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    under_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    substantiated: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    not_substantiated: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    unfounded: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export const findingOutcomeLabels: Record<FindingOutcome, string> = {
    substantiated: 'Substantiated',
    not_substantiated: 'Not Substantiated',
    unsubstantiated: 'Unsubstantiated',
    inconclusive: 'Inconclusive',
};

export const relationshipLabels: Record<Witness['relationship'], string> = {
    complainant: 'Complainant',
    respondent: 'Respondent',
    coworker: 'Coworker',
    manager: 'Manager',
    third_party: 'Third Party',
};

export const interviewStatusBadgeClass: Record<InterviewStatus, string> = {
    not_scheduled: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    scheduled: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    rescheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

export const documentTypeLabels: Record<InvestigationDocument['type'], string> = {
    report: 'Report',
    plan: 'Plan',
    correspondence: 'Correspondence',
    consent_form: 'Consent Form',
    summary: 'Summary',
};

export const documentStatusLabels: Record<InvestigationDocument['status'], string> = {
    draft: 'Draft',
    final: 'Final',
    shared: 'Shared',
};

export const documentStatusBadgeClass: Record<InvestigationDocument['status'], string> = {
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    final: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    shared: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
};
