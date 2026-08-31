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
    Interview,
    MatterNote,
    PermissionSummary,
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

export interface MatterPayload {
    title: string;
    clientId: number;
    investigatorId?: number | null;
    type: Investigation['type'];
    status: Investigation['status'];
    priority: Investigation['priority'];
    openedAt: string;
    targetCompletionDate: string;
    description: string;
}

export function createMatter(payload: MatterPayload): Promise<Investigation> {
    return api.post<Investigation>('/matters', payload);
}

export function updateMatter(id: string, payload: Partial<MatterPayload>): Promise<Investigation> {
    return api.put<Investigation>(`/matters/${id}`, payload);
}

export function deleteMatter(id: string): Promise<void> {
    return api.delete(`/matters/${id}`);
}

/** Staff users who can be assigned as the investigator on a matter. */
export function getAssignableUsers(): Promise<AuthUser[]> {
    return api.get<AuthUser[]>('/users/assignable');
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

export function createAllegation(matterId: string, payload: { title: string; description: string; category: string; status: string }): Promise<Allegation> {
    return api.post<Allegation>(`/matters/${matterId}/allegations`, payload);
}

export function updateAllegation(
    matterId: string,
    allegationId: string,
    payload: Partial<{ title: string; description: string; category: string; status: string }>,
): Promise<Allegation> {
    return api.put<Allegation>(`/matters/${matterId}/allegations/${allegationId}`, payload);
}

export function deleteAllegation(matterId: string, allegationId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/allegations/${allegationId}`);
}

export function createWitness(
    matterId: string,
    payload: Record<string, string | null>,
): Promise<Witness> {
    return api.post<Witness>(`/matters/${matterId}/witnesses`, payload);
}

export function updateWitness(matterId: string, witnessId: string, payload: Record<string, string | null>): Promise<Witness> {
    return api.put<Witness>(`/matters/${matterId}/witnesses/${witnessId}`, payload);
}

export function deleteWitness(matterId: string, witnessId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/witnesses/${witnessId}`);
}

export function createInterview(matterId: string, payload: Record<string, string | number | null>): Promise<Interview> {
    return api.post<Interview>(`/matters/${matterId}/interviews`, payload);
}

export function updateInterview(matterId: string, interviewId: string, payload: Record<string, string | number | null>): Promise<Interview> {
    return api.put<Interview>(`/matters/${matterId}/interviews/${interviewId}`, payload);
}

export function deleteInterview(matterId: string, interviewId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/interviews/${interviewId}`);
}

export function createEvidence(matterId: string, payload: Record<string, unknown>): Promise<Evidence> {
    return api.post<Evidence>(`/matters/${matterId}/evidence`, payload);
}

export function updateEvidence(matterId: string, evidenceId: string, payload: Record<string, unknown>): Promise<Evidence> {
    return api.put<Evidence>(`/matters/${matterId}/evidence/${evidenceId}`, payload);
}

export function deleteEvidence(matterId: string, evidenceId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/evidence/${evidenceId}`);
}

export function createTimelineEvent(matterId: string, payload: Record<string, string | null>): Promise<TimelineEvent> {
    return api.post<TimelineEvent>(`/matters/${matterId}/timeline-events`, payload);
}

export function updateTimelineEvent(matterId: string, eventId: string, payload: Record<string, string | null>): Promise<TimelineEvent> {
    return api.put<TimelineEvent>(`/matters/${matterId}/timeline-events/${eventId}`, payload);
}

export function deleteTimelineEvent(matterId: string, eventId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/timeline-events/${eventId}`);
}

export function createDocument(matterId: string, payload: { name: string; type: string; status: string }): Promise<InvestigationDocument> {
    return api.post<InvestigationDocument>(`/matters/${matterId}/documents`, payload);
}

export function updateDocument(matterId: string, documentId: string, payload: Partial<{ name: string; type: string; status: string }>): Promise<InvestigationDocument> {
    return api.put<InvestigationDocument>(`/matters/${matterId}/documents/${documentId}`, payload);
}

export function deleteDocument(matterId: string, documentId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/documents/${documentId}`);
}

export function updateNote(matterId: string, noteId: string, body: string): Promise<MatterNote> {
    return api.put<MatterNote>(`/matters/${matterId}/notes/${noteId}`, { body });
}

export function getClients(): Promise<ClientSummary[]> {
    return api.get<ClientSummary[]>('/clients');
}

export function createClient(payload: { name: string; contactEmail?: string | null }): Promise<ClientSummary> {
    return api.post<ClientSummary>('/clients', payload);
}

export function updateClient(clientSlug: string, payload: { name: string; contactEmail?: string | null }): Promise<ClientSummary> {
    return api.put<ClientSummary>(`/clients/${clientSlug}`, payload);
}

export function deleteClient(clientSlug: string): Promise<void> {
    return api.delete(`/clients/${clientSlug}`);
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

export function deleteNote(matterId: string, noteId: string): Promise<void> {
    return api.delete(`/matters/${matterId}/notes/${noteId}`);
}

export function getReport(matterId: string): Promise<InvestigationReport> {
    return api.get<InvestigationReport>(`/matters/${matterId}/report`);
}

export function saveReport(matterId: string, patch: Partial<InvestigationReport>): Promise<InvestigationReport> {
    return api.put<InvestigationReport>(`/matters/${matterId}/report`, patch);
}

export function saveFinding(matterId: string, allegationId: string, finding: FindingOutcome | null, findingNotes?: string): Promise<Allegation> {
    return api.put<Allegation>(`/matters/${matterId}/allegations/${allegationId}`, {
        ...(finding === null ? {} : { finding }),
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

export function updateProfile(payload: FormData): Promise<AuthUser> {
    return api.post<AuthUser>('/profile', payload);
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

export function getPermissions(): Promise<PermissionSummary[]> {
    return api.get<PermissionSummary[]>('/permissions');
}

export function createPermission(name: string): Promise<PermissionSummary> {
    return api.post<PermissionSummary>('/permissions', { name });
}

export function updatePermission(permissionId: number, name: string): Promise<PermissionSummary> {
    return api.put<PermissionSummary>(`/permissions/${permissionId}`, { name });
}

export function deletePermission(permissionId: number): Promise<void> {
    return api.delete(`/permissions/${permissionId}`);
}
