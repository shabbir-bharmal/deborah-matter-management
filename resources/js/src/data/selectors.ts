/**
 * Data access for the SPA. Every function hits the Laravel API; the datasets in
 * this folder are kept only as the seed source (see scripts/dump-mock-data.mjs).
 */
import { api } from '~/lib/api';
import type {
    Allegation,
    AppNotification,
    AuthUser,
    CalendarEvent,
    ClientPortal,
    ClientSummary,
    DashboardSnapshot,
    Evidence,
    FindingOutcome,
    InterviewWithWitness,
    Investigation,
    InvestigationDocument,
    InvestigationReport,
    MatterNote,
    TimelineEvent,
    Witness,
} from '~/types';

export function getInvestigations(): Promise<Investigation[]> {
    return api.get<Investigation[]>('/investigations');
}

export async function getInvestigation(id: string): Promise<Investigation | undefined> {
    try {
        return await api.get<Investigation>(`/investigations/${id}`);
    } catch {
        return undefined;
    }
}

export function getAllegationsByInvestigation(investigationId: string): Promise<Allegation[]> {
    return api.get<Allegation[]>(`/investigations/${investigationId}/allegations`);
}

export function getWitnessesByInvestigation(investigationId: string): Promise<Witness[]> {
    return api.get<Witness[]>(`/investigations/${investigationId}/witnesses`);
}

export function getInterviewsByInvestigation(investigationId: string): Promise<InterviewWithWitness[]> {
    return api.get<InterviewWithWitness[]>(`/investigations/${investigationId}/interviews`);
}

export function getEvidenceByInvestigation(investigationId: string): Promise<Evidence[]> {
    return api.get<Evidence[]>(`/investigations/${investigationId}/evidence`);
}

export function getTimelineEventsByInvestigation(investigationId: string): Promise<TimelineEvent[]> {
    return api.get<TimelineEvent[]>(`/investigations/${investigationId}/timeline-events`);
}

export function getDocumentsByInvestigation(investigationId: string): Promise<InvestigationDocument[]> {
    return api.get<InvestigationDocument[]>(`/investigations/${investigationId}/documents`);
}

export function getClients(): Promise<ClientSummary[]> {
    return api.get<ClientSummary[]>('/clients');
}

export async function getClientPortal(slug: string): Promise<ClientPortal | undefined> {
    try {
        return await api.get<ClientPortal>(`/clients/${slug}`);
    } catch {
        return undefined;
    }
}

export function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    return api.get<DashboardSnapshot>('/dashboard');
}

export function getCalendarEvents(): Promise<CalendarEvent[]> {
    return api.get<CalendarEvent[]>('/calendar');
}

export function getNotifications(): Promise<AppNotification[]> {
    return api.get<AppNotification[]>('/notifications');
}

export function getNotes(investigationId: string): Promise<MatterNote[]> {
    return api.get<MatterNote[]>(`/investigations/${investigationId}/notes`);
}

export function createNote(investigationId: string, body: string): Promise<MatterNote> {
    return api.post<MatterNote>(`/investigations/${investigationId}/notes`, { body });
}

export function deleteNote(noteId: string): Promise<void> {
    return api.delete(`/notes/${noteId}`);
}

export function getReport(investigationId: string): Promise<InvestigationReport> {
    return api.get<InvestigationReport>(`/investigations/${investigationId}/report`);
}

export function saveReport(investigationId: string, patch: Partial<InvestigationReport>): Promise<InvestigationReport> {
    return api.put<InvestigationReport>(`/investigations/${investigationId}/report`, patch);
}

export function saveFinding(allegationId: string, finding: FindingOutcome | null, findingNotes?: string): Promise<Allegation> {
    return api.patch<Allegation>(`/allegations/${allegationId}`, {
        finding,
        ...(findingNotes === undefined ? {} : { findingNotes }),
    });
}

export function login(email: string, password: string, remember = false): Promise<AuthUser> {
    return api.post<AuthUser>('/login', { email, password, remember });
}

export function logout(): Promise<unknown> {
    return api.post('/logout');
}

export function getAuthUser(): Promise<AuthUser> {
    return api.get<AuthUser>('/user');
}
