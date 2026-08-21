import { allegations } from '~/data/allegations';
import { documents } from '~/data/documents';
import { evidence } from '~/data/evidence';
import { interviews } from '~/data/interviews';
import { investigations } from '~/data/investigations';
import { timelineEvents } from '~/data/timeline-events';
import { witnesses } from '~/data/witnesses';
import type {
    Allegation,
    AppNotification,
    ClientPortal,
    ClientSummary,
    DashboardSnapshot,
    Evidence,
    Interview,
    InterviewWithWitness,
    Investigation,
    InvestigationDocument,
    RecentActivityItem,
    TimelineEvent,
    UpcomingInterviewItem,
    Witness,
} from '~/types';

const delay = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getInvestigations(): Promise<Investigation[]> {
    await delay();
    return investigations;
}

export async function getInvestigation(id: string): Promise<Investigation | undefined> {
    await delay();
    return investigations.find((investigation) => investigation.id === id);
}

export async function getAllegationsByInvestigation(investigationId: string): Promise<Allegation[]> {
    await delay();
    return allegations.filter((allegation) => allegation.investigationId === investigationId);
}

export async function getWitnessesByInvestigation(investigationId: string): Promise<Witness[]> {
    await delay();
    return witnesses.filter((witness) => witness.investigationId === investigationId);
}

function joinWitness(interview: Interview): InterviewWithWitness {
    const witness = witnesses.find((candidate) => candidate.id === interview.witnessId);
    return {
        ...interview,
        witnessName: witness?.name ?? 'Unknown witness',
        witnessRole: witness?.role ?? '',
    };
}

export async function getInterviewsByInvestigation(investigationId: string): Promise<InterviewWithWitness[]> {
    await delay();
    return interviews.filter((interview) => interview.investigationId === investigationId).map(joinWitness);
}

export async function getEvidenceByInvestigation(investigationId: string): Promise<Evidence[]> {
    await delay();
    return evidence.filter((item) => item.investigationId === investigationId);
}

export async function getTimelineEventsByInvestigation(investigationId: string): Promise<TimelineEvent[]> {
    await delay();
    return timelineEvents.filter((event) => event.investigationId === investigationId).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDocumentsByInvestigation(investigationId: string): Promise<InvestigationDocument[]> {
    await delay();
    return documents.filter((document) => document.investigationId === investigationId);
}

const ACTIVE_STATUSES: Investigation['status'][] = ['open', 'in_progress', 'review'];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

const STAGE_BY_STATUS: Record<Investigation['status'], number> = {
    open: 0,
    in_progress: 2,
    review: 3,
    completed: 4,
    closed: 4,
};

export async function getClients(): Promise<ClientSummary[]> {
    await delay();
    const byClient = new Map<string, ClientSummary>();
    for (const investigation of investigations) {
        const id = slugify(investigation.client);
        const entry = byClient.get(id) ?? { id, name: investigation.client, matterCount: 0, activeCount: 0 };
        entry.matterCount += 1;
        if (ACTIVE_STATUSES.includes(investigation.status)) {
            entry.activeCount += 1;
        }
        byClient.set(id, entry);
    }
    return [...byClient.values()];
}

export async function getClientPortal(slug: string): Promise<ClientPortal | undefined> {
    await delay();
    const matters = investigations.filter((investigation) => slugify(investigation.client) === slug);
    if (matters.length === 0) {
        return undefined;
    }
    return {
        id: slug,
        name: matters[0].client,
        matters: matters.map((matter) => ({
            ...matter,
            stageIndex: STAGE_BY_STATUS[matter.status],
            upcomingInterviews: interviews
                .filter(
                    (interview) =>
                        interview.investigationId === matter.id && (interview.status === 'scheduled' || interview.status === 'rescheduled'),
                )
                .map(joinWitness),
            sharedDocuments: documents.filter((document) => document.investigationId === matter.id && document.status === 'shared'),
            latestEvent: timelineEvents.filter((event) => event.investigationId === matter.id).sort((a, b) => b.date.localeCompare(a.date))[0],
        })),
    };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    await delay();

    const activeMatters = investigations.filter((investigation) => ACTIVE_STATUSES.includes(investigation.status));
    const today = new Date().toISOString().slice(0, 10);

    const upcomingInterviews: UpcomingInterviewItem[] = interviews
        .filter(
            (interview) => (interview.status === 'scheduled' || interview.status === 'rescheduled') && interview.scheduledAt.slice(0, 10) >= today,
        )
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        .slice(0, 5)
        .map((interview) => {
            const investigation = investigations.find((candidate) => candidate.id === interview.investigationId);
            const joined = joinWitness(interview);
            return {
                ...joined,
                investigationReference: investigation?.referenceNumber ?? '',
                investigationTitle: investigation?.title ?? '',
            };
        });

    const recentActivity: RecentActivityItem[] = [...timelineEvents]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6)
        .map((event) => {
            const investigation = investigations.find((candidate) => candidate.id === event.investigationId);
            return {
                event,
                investigationReference: investigation?.referenceNumber ?? '',
                investigationTitle: investigation?.title ?? '',
            };
        });

    const statusCounts = (['open', 'in_progress', 'review', 'completed', 'closed'] as const).map((status) => ({
        status,
        count: investigations.filter((investigation) => investigation.status === status).length,
    }));

    const priorityCounts = (['critical', 'high', 'medium', 'low'] as const).map((priority) => ({
        priority,
        count: activeMatters.filter((investigation) => investigation.priority === priority).length,
    }));

    const activeIds = new Set(activeMatters.map((matter) => matter.id));

    const pendingActions = [
        {
            id: 'allegations-awaiting-review',
            label: 'Allegations awaiting review',
            count: allegations.filter(
                (allegation) => activeIds.has(allegation.investigationId) && ['pending', 'under_review'].includes(allegation.status),
            ).length,
        },
        {
            id: 'evidence-to-review',
            label: 'Evidence items to review',
            count: evidence.filter((item) => activeIds.has(item.investigationId) && ['received', 'in_review'].includes(item.status)).length,
        },
        {
            id: 'witnesses-unscheduled',
            label: 'Witnesses awaiting scheduling',
            count: witnesses.filter((witness) => activeIds.has(witness.investigationId) && witness.interviewStatus === 'not_scheduled').length,
        },
    ];

    return {
        activeMatterCount: activeMatters.length,
        completedMatterCount: investigations.filter((investigation) => ['completed', 'closed'].includes(investigation.status)).length,
        overdueMatterCount: activeMatters.filter((investigation) => investigation.targetCompletionDate < today).length,
        statusCounts,
        priorityCounts,
        upcomingInterviews,
        recentActivity,
        pendingActions,
    };
}

export async function getNotifications(): Promise<AppNotification[]> {
    await delay();

    const notifications: AppNotification[] = [];

    for (const interview of interviews) {
        if (interview.status !== 'scheduled' && interview.status !== 'rescheduled') {
            continue;
        }
        const investigation = investigations.find((candidate) => candidate.id === interview.investigationId);
        const witness = witnesses.find((candidate) => candidate.id === interview.witnessId);
        notifications.push({
            id: `interview-${interview.id}`,
            kind: 'interview',
            title: `Interview ${interview.status === 'rescheduled' ? 'rescheduled' : 'scheduled'} — ${witness?.name ?? 'witness'}`,
            description: `${investigation?.referenceNumber ?? ''} · ${formatDateTime(interview.scheduledAt)}`,
            date: interview.scheduledAt,
            href: `/investigations/${interview.investigationId}/interviews`,
        });
    }

    for (const item of evidence) {
        if (item.status !== 'received' && item.status !== 'in_review') {
            continue;
        }
        const investigation = investigations.find((candidate) => candidate.id === item.investigationId);
        notifications.push({
            id: `evidence-${item.id}`,
            kind: 'evidence',
            title: item.status === 'received' ? 'New evidence awaiting review' : 'Evidence review in progress',
            description: `${item.title} · ${investigation?.referenceNumber ?? ''}`,
            date: item.date,
            href: `/investigations/${item.investigationId}/evidence`,
        });
    }

    for (const document of documents) {
        if (document.type !== 'report' || document.status !== 'draft') {
            continue;
        }
        const investigation = investigations.find((candidate) => candidate.id === document.investigationId);
        notifications.push({
            id: `report-${document.id}`,
            kind: 'report',
            title: 'Report draft ready',
            description: `${document.name} · ${investigation?.referenceNumber ?? ''}`,
            date: document.createdAt,
            href: `/investigations/${document.investigationId}/reports`,
        });
    }

    for (const investigation of investigations) {
        if (!ACTIVE_STATUSES.includes(investigation.status)) {
            continue;
        }
        const latest = timelineEvents.filter((event) => event.investigationId === investigation.id).sort((a, b) => b.date.localeCompare(a.date))[0];
        if (!latest) {
            continue;
        }
        notifications.push({
            id: `milestone-${latest.id}`,
            kind: 'milestone',
            title: `${investigation.referenceNumber} update`,
            description: latest.title,
            date: latest.date,
            href: `/investigations/${investigation.id}/timeline`,
        });
    }

    return notifications.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}
