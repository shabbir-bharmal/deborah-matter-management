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
    RoleMatrix,
    RoleSummary,
    TimelineEvent,
    Witness,
} from '~/types';

export function getMatters(): Promise<Investigation[]> {
    return api.get<Investigation[]>('/matters');
}

export async function getMatter(id: string): Promise<Investigation | undefined> {
    try {
        return await api.get<Investigation>(`/matters/${id}`);
    } catch {
        return undefined;
    }
}

export function getAllegationsByMatter(matterId: string): Promise<Allegation[]> {
    return api.get<Allegation[]>(`/matters/${matterId}/allegations`);
}

export function getWitnessesByMatter(matterId: string): Promise<Witness[]> {
    return api.get<Witness[]>(`/matters/${matterId}/witnesses`);
}

export function getInterviewsByMatter(matterId: string): Promise<InterviewWithWitness[]> {
    return api.get<InterviewWithWitness[]>(`/matters/${matterId}/interviews`);
}

export function getEvidenceByMatter(matterId: string): Promise<Evidence[]> {
    return api.get<Evidence[]>(`/matters/${matterId}/evidence`);
}

export function getTimelineEventsByMatter(matterId: string): Promise<TimelineEvent[]> {
    return api.get<TimelineEvent[]>(`/matters/${matterId}/timeline-events`);
}

export function getDocumentsByMatter(matterId: string): Promise<InvestigationDocument[]> {
    return api.get<InvestigationDocument[]>(`/matters/${matterId}/documents`);
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

export function getNotes(matterId: string): Promise<MatterNote[]> {
    return api.get<MatterNote[]>(`/matters/${matterId}/notes`);
}

export function createNote(matterId: string, body: string): Promise<MatterNote> {
    return api.post<MatterNote>(`/matters/${matterId}/notes`, { body });
}

export function deleteNote(noteId: string): Promise<void> {
    return api.delete(`/notes/${noteId}`);
}

export function getReport(matterId: string): Promise<InvestigationReport> {
    return api.get<InvestigationReport>(`/matters/${matterId}/report`);
}

export function saveReport(matterId: string, patch: Partial<InvestigationReport>): Promise<InvestigationReport> {
    return api.put<InvestigationReport>(`/matters/${matterId}/report`, patch);
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

/* Administration — user accounts and the role/permission matrix. */

export function getUsers(): Promise<AuthUser[]> {
    return api.get<AuthUser[]>('/users');
}

export function createUser(payload: { name: string; email: string; password: string; role: string; clientId?: number | null }): Promise<AuthUser> {
    return api.post<AuthUser>('/users', payload);
}

export function updateUser(
    id: number,
    payload: Partial<{ name: string; email: string; password: string; role: string; clientId: number | null }>,
): Promise<AuthUser> {
    return api.patch<AuthUser>(`/users/${id}`, payload);
}

export function deleteUser(id: number): Promise<void> {
    return api.delete(`/users/${id}`);
}

export function getRoles(): Promise<RoleMatrix> {
    return api.get<RoleMatrix>('/roles');
}

export function updateRolePermissions(roleId: number, permissions: string[]): Promise<RoleSummary> {
    return api.put<RoleSummary>(`/roles/${roleId}`, { permissions });
}
