import type { ReportConfig } from '~/hooks/use-report-store';
import type { Allegation, Evidence, FindingOutcome, InterviewWithWitness, Investigation, TimelineEvent } from '~/types';

export interface ReportSectionDef {
    id: string;
    heading: string;
}

export const reportSectionDefs: ReportSectionDef[] = [
    { id: 'summary', heading: 'Matter summary' },
    { id: 'allegations', heading: 'Allegations and findings' },
    { id: 'interviews', heading: 'Witness interviews' },
    { id: 'evidence', heading: 'Evidence reviewed' },
    { id: 'timeline', heading: 'Key events' },
    { id: 'conclusion', heading: 'Conclusion' },
];

export interface ReportSection {
    id: string;
    heading: string;
    paragraphs: string[];
    bullets: string[];
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function buildReport(input: {
    matter: Investigation;
    allegations: Allegation[];
    interviews: InterviewWithWitness[];
    evidenceItems: Evidence[];
    events: TimelineEvent[];
    savedFindings: Record<string, FindingOutcome | undefined>;
    config?: ReportConfig;
    autoFill?: Record<string, string[]>;
    autoFillSections?: { id: string; heading: string; bullets: string[] }[];
}): ReportSection[] {
    const { matter, allegations, interviews, evidenceItems, events, savedFindings, config } = input;
    const includedSections = config?.includedSections ?? {};

    const findingFor = (allegation: Allegation): FindingOutcome | undefined => savedFindings[allegation.id] ?? allegation.finding ?? undefined;

    const counts = {
        substantiated: allegations.filter((allegation) => findingFor(allegation) === 'substantiated').length,
        notSubstantiated: allegations.filter((allegation) => findingFor(allegation) === 'not_substantiated').length,
        inconclusive: allegations.filter((allegation) => findingFor(allegation) === 'inconclusive').length,
        pending: allegations.filter((allegation) => !findingFor(allegation)).length,
    };

    const completedInterviews = interviews.filter((interview) => interview.status === 'completed');
    const outstandingInterviews = interviews.filter((interview) => interview.status !== 'completed' && interview.status !== 'cancelled');
    const reviewedEvidence = evidenceItems.filter((item) => item.status === 'reviewed');

    const allSections: ReportSection[] = [
        {
            id: 'summary',
            heading: 'Matter summary',
            paragraphs: [
                `Investigation ${matter.referenceNumber} (“${matter.title}”) was opened for ${matter.client} on ${formatDate(
                    matter.openedAt,
                )} and assigned to ${matter.investigator}. The target completion date is ${formatDate(matter.targetCompletionDate)}${
                    matter.completedAt ? `; the investigation was completed on ${formatDate(matter.completedAt)}` : ''
                }.`,
                matter.description,
            ],
            bullets: [],
        },
        {
            id: 'allegations',
            heading: 'Allegations and findings',
            paragraphs: [],
            bullets: allegations.map((allegation) => {
                const finding = findingFor(allegation);
                return `${allegation.title} — ${finding ? `finding: ${finding.replace('_', ' ')}` : 'finding pending'}.`;
            }),
        },
        {
            id: 'interviews',
            heading: 'Witness interviews',
            paragraphs: [
                `${completedInterviews.length} interview${completedInterviews.length === 1 ? '' : 's'} conducted${
                    outstandingInterviews.length > 0
                        ? `; ${outstandingInterviews.length} outstanding (including the respondent where applicable).`
                        : '.'
                }`,
            ],
            bullets: completedInterviews.map(
                (interview) =>
                    `${interview.witnessName} (${interview.witnessRole}) — interviewed by ${interview.interviewer} on ${formatDate(
                        interview.scheduledAt,
                    )}.`,
            ),
        },
        {
            id: 'evidence',
            heading: 'Evidence reviewed',
            paragraphs: [
                `${reviewedEvidence.length} of ${evidenceItems.length} evidence item${evidenceItems.length === 1 ? '' : 's'} have completed review.`,
            ],
            bullets: reviewedEvidence.map((item) => `${item.title} (${item.type.replace('_', ' ')}, ${formatDate(item.date)}).`),
        },
        {
            id: 'timeline',
            heading: 'Key events',
            paragraphs: [],
            bullets: events.map((event) => `${formatDate(event.date)} — ${event.title}.`),
        },
        {
            id: 'conclusion',
            heading: 'Conclusion',
            paragraphs: [
                `Of the ${allegations.length} allegation${allegations.length === 1 ? '' : 's'} investigated, ${counts.substantiated} ${
                    counts.substantiated === 1 ? 'was' : 'were'
                } substantiated, ${counts.notSubstantiated} not substantiated, and ${counts.inconclusive} inconclusive${
                    counts.pending > 0
                        ? `. Findings for ${counts.pending} allegation${counts.pending === 1 ? '' : 's'} remain pending completion of outstanding work`
                        : '.'
                }.`,
                counts.pending > 0
                    ? 'This report is an interim draft and will be finalised once all findings are recorded.'
                    : 'This report is ready for release to the client.',
            ],
            bullets: [],
        },
    ];

    const selected = allSections.filter((section) => includedSections[section.id] ?? true);

    // Auto-fill (report auto-fill POC): append accepted lines from uploaded
    // supporting files to their matching sections, without displacing
    // generated content.
    const autoFill = input.autoFill;
    if (autoFill) {
        for (const section of selected) {
            const extra = autoFill[section.id];
            if (extra && extra.length > 0) {
                section.bullets = [...section.bullets, ...extra];
            }
        }
    }

    // Auto-fill custom sections: headings found in uploaded files that had no
    // canonical counterpart are appended as new report sections.
    if (input.autoFillSections) {
        for (const custom of input.autoFillSections) {
            if (custom.bullets.length > 0) {
                selected.push({ id: custom.id, heading: custom.heading, paragraphs: [], bullets: custom.bullets });
            }
        }
    }

    const executiveSummary = config?.executiveSummary.trim();
    if (executiveSummary) {
        selected.unshift({ id: 'exec-summary', heading: 'Executive summary', paragraphs: [executiveSummary], bullets: [] });
    }

    return selected.map((section, index) => ({ ...section, heading: `${index + 1}. ${section.heading}` }));
}
