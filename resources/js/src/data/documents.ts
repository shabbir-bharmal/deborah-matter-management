import type { InvestigationDocument } from '~/types';

export const documents: InvestigationDocument[] = [
    {
        id: 'doc-001',
        investigationId: 'inv-001',
        name: 'Investigation plan v2',
        type: 'plan',
        status: 'final',
        createdAt: '2026-06-06',
    },
    {
        id: 'doc-002',
        investigationId: 'inv-001',
        name: 'Interview transcript — Sarah Okafor',
        type: 'summary',
        status: 'shared',
        createdAt: '2026-06-20',
    },
    {
        id: 'doc-003',
        investigationId: 'inv-001',
        name: 'Interim measures letter — respondent',
        type: 'correspondence',
        status: 'shared',
        createdAt: '2026-07-15',
    },
    {
        id: 'doc-004',
        investigationId: 'inv-001',
        name: 'Draft findings report',
        type: 'report',
        status: 'draft',
        createdAt: '2026-08-12',
    },
    {
        id: 'doc-005',
        investigationId: 'inv-002',
        name: 'Investigation plan v1',
        type: 'plan',
        status: 'draft',
        createdAt: '2026-07-16',
    },
    {
        id: 'doc-006',
        investigationId: 'inv-003',
        name: 'Final report INV-2026-003',
        type: 'report',
        status: 'shared',
        createdAt: '2026-07-28',
    },
];
