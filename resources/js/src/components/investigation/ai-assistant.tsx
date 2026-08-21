import { Bot, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { getAllegationsByInvestigation, getEvidenceByInvestigation, getInterviewsByInvestigation } from '~/data/selectors';
import { allegationStatusLabels } from '~/lib/status';
import type { Allegation, Evidence as EvidenceItem, InterviewWithWitness, Investigation } from '~/types';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    sources?: string;
}

interface MatterStats {
    allegations: Allegation[];
    interviews: InterviewWithWitness[];
    evidenceItems: EvidenceItem[];
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AiAssistant({ matter }: { matter: Investigation }) {
    const [open, setOpen] = useState(false);
    const [stats, setStats] = useState<MatterStats | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                text: `Hello — I am the prototype assistant for ${matter.referenceNumber}. Choose a prompt below and I will answer from this matter's mock data.`,
            },
        ]);
    }, [matter.id, matter.referenceNumber]);

    useEffect(() => {
        if (!open || stats) {
            return;
        }
        let cancelled = false;
        Promise.all([getAllegationsByInvestigation(matter.id), getInterviewsByInvestigation(matter.id), getEvidenceByInvestigation(matter.id)]).then(
            ([allegations, interviews, evidenceItems]) => {
                if (!cancelled) {
                    setStats({ allegations, interviews, evidenceItems });
                }
            },
        );
        return () => {
            cancelled = true;
        };
    }, [open, matter.id, stats]);

    const prompts: { label: string; build: (data: MatterStats) => Message }[] = [
        {
            label: 'Summarize this matter',
            build: (data) => ({
                role: 'assistant',
                text: `${matter.title} is currently ${matter.status.replace('_', ' ')} (priority: ${matter.priority}). It involves ${data.allegations.length} allegation(s), ${data.interviews.length} interview(s), and ${data.evidenceItems.length} evidence item(s). Target completion is ${formatDate(matter.targetCompletionDate)}.`,
                sources: 'Sources: Overview, Allegations, Interviews, Evidence tabs',
            }),
        },
        {
            label: 'Which allegations are still open?',
            build: (data) => {
                const open = data.allegations.filter((allegation) => allegation.status === 'pending' || allegation.status === 'under_review');
                return {
                    role: 'assistant',
                    text:
                        open.length === 0
                            ? 'All allegations have a recorded outcome.'
                            : `${open.length} allegation(s) await an outcome:\n${open
                                  .map((allegation) => `• ${allegation.title} (${allegationStatusLabels[allegation.status]})`)
                                  .join('\n')}`,
                    sources: 'Sources: Allegations tab',
                };
            },
        },
        {
            label: 'What supports the substantiated findings?',
            build: (data) => {
                const supporting = data.evidenceItems.filter((item) =>
                    item.supportsAllegations.some((allegationId) =>
                        data.allegations.some(
                            (allegation) =>
                                allegation.id === allegationId && (allegation.finding === 'substantiated' || allegation.status === 'substantiated'),
                        ),
                    ),
                );
                return {
                    role: 'assistant',
                    text:
                        supporting.length === 0
                            ? 'No substantiated findings yet, so there is no supporting evidence to cite.'
                            : `Key supporting evidence:\n${supporting.map((item) => `• ${item.title}`).join('\n')}`,
                    sources: 'Sources: Evidence tab (supporting stances), Findings tab',
                };
            },
        },
        {
            label: 'Questions for the next interview',
            build: (data) => {
                const next = data.interviews.find((interview) => interview.status === 'scheduled' || interview.status === 'rescheduled');
                if (!next) {
                    return {
                        role: 'assistant',
                        text: 'There are no scheduled interviews left on this matter.',
                        sources: 'Sources: Interviews tab',
                    };
                }
                return {
                    role: 'assistant',
                    text: `Suggested opening questions for ${next.witnessName} (${formatDate(next.scheduledAt)}):\n• Walk me through your role and how you interact with the parties involved.\n• What did you observe directly, and what did you hear second-hand?\n• Is there anything in the incident log you would correct or add to?\n• Who else may have witnessed the events described?`,
                    sources: 'Sources: Interviews tab, Witness notes',
                };
            },
        },
        {
            label: 'Outstanding actions',
            build: (data) => {
                const pendingAllegations = data.allegations.filter((a) => !a.finding && a.status !== 'unfounded').length;
                const unreviewedEvidence = data.evidenceItems.filter((item) => item.status === 'received' || item.status === 'in_review').length;
                const outstandingInterviews = data.interviews.filter((i) => i.status !== 'completed' && i.status !== 'cancelled').length;
                return {
                    role: 'assistant',
                    text: `Outstanding work on this matter:\n• ${pendingAllegations} allegation(s) without a finding\n• ${outstandingInterviews} interview(s) not yet completed\n• ${unreviewedEvidence} evidence item(s) awaiting review`,
                    sources: 'Sources: Allegations, Interviews, Evidence tabs',
                };
            },
        },
    ];

    const askPrompt = (prompt: (typeof prompts)[number]) => {
        if (!stats) {
            return;
        }
        setMessages((current) => [...current, { role: 'user', text: prompt.label }, prompt.build(stats)]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Sparkles className="size-4" /> AI Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="size-5" /> Matter assistant
                        <Badge variant="outline">Concept</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Predefined prompts with static responses over {matter.referenceNumber} mock data — no live AI in the prototype.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border p-3">
                    {messages.map((message, index) => (
                        <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                            <div
                                className={
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground max-w-[80%] rounded-lg px-3 py-2 text-sm'
                                        : 'bg-muted/40 max-w-[85%] rounded-lg border px-3 py-2 text-sm'
                                }
                            >
                                <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                                {message.sources && <p className="text-muted-foreground mt-1.5 text-xs italic">{message.sources}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
                        <User className="size-3.5" /> Predefined prompts
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {prompts.map((prompt) => (
                            <button
                                key={prompt.label}
                                type="button"
                                disabled={!stats}
                                onClick={() => askPrompt(prompt)}
                                className="hover:bg-accent hover:text-foreground rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {stats ? prompt.label : 'Loading matter data…'}
                            </button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
