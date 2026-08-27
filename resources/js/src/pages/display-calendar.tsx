import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { PAGE_TEXT } from '~/constants/menuData';
import { getCalendarEvents } from '~/data/selectors';
import { cn } from '~/lib/utils';
import type { CalendarEvent } from '~/types';

const TEXT = PAGE_TEXT.displayCalendar;

function toKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function buildMonthGrid(monthStart: Date) {
    const firstOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const offset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + index);
        return day;
    });
}

const kindDotClass: Record<CalendarEvent['kind'], string> = {
    interview: 'bg-sky-500',
    deadline: 'bg-amber-500',
};

const kindBadgeClass: Record<CalendarEvent['kind'], string> = {
    interview: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    deadline: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

function EventRow({ event }: { event: CalendarEvent }) {
    return (
        <Link
            to={event.href}
            className="hover:bg-accent flex flex-col gap-1.5 rounded-lg border p-3 transition-colors sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1"
        >
            <span className="flex items-center gap-2">
                <span className={cn('size-2 shrink-0 rounded-full', kindDotClass[event.kind])} aria-hidden="true" />
                <span className="text-sm font-medium whitespace-nowrap tabular-nums">
                    {new Date(`${event.date}T${event.time ?? '00:00'}`).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
                {event.time && (
                    <span className="text-muted-foreground shrink-0 font-mono text-xs whitespace-nowrap">
                        <Clock className="mr-0.5 inline size-3" />
                        {event.time}
                    </span>
                )}
            </span>
            <span className="truncate text-sm sm:min-w-0 sm:flex-1">{event.title}</span>
            <span className="flex items-center justify-between gap-2 sm:ml-auto sm:justify-end">
                <Badge variant="outline" className={kindBadgeClass[event.kind]}>
                    {event.kind === 'interview' ? TEXT.legend.interview : TEXT.legend.deadline}
                </Badge>
                <span className="text-muted-foreground font-mono text-xs whitespace-nowrap">{event.reference}</span>
            </span>
        </Link>
    );
}

export default function DisplayCalendar() {
    const [events, setEvents] = useState<CalendarEvent[] | null>(null);
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [kindFilter, setKindFilter] = useState<'all' | CalendarEvent['kind']>('all');

    useEffect(() => {
        let cancelled = false;
        getCalendarEvents().then((result) => {
            if (!cancelled) {
                setEvents(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const todayKey = toKey(new Date());

    const visibleEvents = useMemo(() => (events ?? []).filter((event) => kindFilter === 'all' || event.kind === kindFilter), [events, kindFilter]);

    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const event of visibleEvents) {
            const bucket = map.get(event.date);
            if (bucket) {
                bucket.push(event);
            } else {
                map.set(event.date, [event]);
            }
        }
        return map;
    }, [visibleEvents]);

    const grid = useMemo(() => buildMonthGrid(month), [month]);

    const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];
    const upcomingEvents = useMemo(() => visibleEvents.filter((event) => event.date >= todayKey), [visibleEvents, todayKey]);

    if (!events) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Loading display calendar">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-96 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    const shiftMonth = (delta: number) => {
        setSelectedDay(null);
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{TEXT.title}</h1>
                <p className="text-muted-foreground text-sm">{TEXT.subtitle}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[70%_30%]">
                <Card className="min-w-0">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <CardTitle className="text-base">{monthLabel(month)}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const now = new Date();
                                        setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                                        setSelectedDay(todayKey);
                                    }}
                                >
                                    {TEXT.today}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => shiftMonth(1)} aria-label="Next month">
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                        <CardDescription className="flex items-center gap-4 pt-1">
                            <span className="flex items-center gap-1.5">
                                <span className={cn('size-2 rounded-full', kindDotClass.interview)} aria-hidden="true" /> {TEXT.legend.interview}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className={cn('size-2 rounded-full', kindDotClass.deadline)} aria-hidden="true" /> {TEXT.legend.deadline}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto" data-testid="calendar-grid-scroll">
                            <div className="bg-border grid min-w-[640px] grid-cols-7 gap-px overflow-hidden rounded-lg border text-sm">
                                {TEXT.weekDays.map((day) => (
                                    <div key={day} className="text-muted-foreground bg-background px-2 py-1.5 text-center text-xs font-medium">
                                        {day}
                                    </div>
                                ))}
                                {grid.map((day) => {
                                    const key = toKey(day);
                                    const inMonth = day.getMonth() === month.getMonth();
                                    const dayEvents = eventsByDay.get(key) ?? [];
                                    const isSelected = key === selectedDay;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedDay(isSelected ? null : key)}
                                            className={cn(
                                                'flex min-h-16 flex-col items-stretch gap-1 p-1.5 text-left transition-colors sm:min-h-20',
                                                'bg-background hover:bg-accent/50',
                                                !inMonth && 'text-muted-foreground bg-muted/40',
                                                isSelected && 'ring-primary ring-2 ring-inset',
                                            )}
                                        >
                                            <span className="flex items-center justify-between">
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium tabular-nums',
                                                        key === todayKey && 'bg-primary text-primary-foreground rounded-full px-1.5',
                                                    )}
                                                >
                                                    {day.getDate()}
                                                </span>
                                                {dayEvents.length > 0 && (
                                                    <span className="text-muted-foreground text-[10px] tabular-nums">{dayEvents.length}</span>
                                                )}
                                            </span>
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <span
                                                    key={event.id}
                                                    className={cn(
                                                        'truncate rounded px-1 py-0.5 text-[10px] leading-tight',
                                                        event.kind === 'interview'
                                                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                                                    )}
                                                >
                                                    <span className="hidden sm:inline">{event.time ? `${event.time} ` : ''}</span>
                                                    {event.title}
                                                </span>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className="text-muted-foreground text-[10px]">
                                                    +{dayEvents.length - 2} {TEXT.more}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="mb-2 text-sm font-medium">
                                {selectedDay
                                    ? `${TEXT.selectedDay} ${new Date(`${selectedDay}T00:00`).toLocaleDateString('en-GB', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                      })}`
                                    : TEXT.noSelection}
                            </h3>
                            {selectedDay && selectedEvents.length === 0 && <p className="text-muted-foreground text-sm">{TEXT.noEvents}</p>}
                            <div className="space-y-2">
                                {selectedEvents.map((event) => (
                                    <EventRow key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex min-w-0 flex-col overflow-hidden lg:max-h-[calc(100vh-13rem)]" data-testid="upcoming-card">
                    <CardHeader className="shrink-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="size-4" /> {TEXT.upcomingTitle}
                        </CardTitle>
                        <CardDescription>{TEXT.upcomingDescription} </CardDescription>
                        <div className="flex items-center gap-2 pt-1">
                            <label htmlFor="upcoming-kind-filter" className="text-sm font-medium">
                                {TEXT.filterLabel}
                            </label>
                            <select
                                id="upcoming-kind-filter"
                                aria-label={TEXT.filterLabel}
                                value={kindFilter}
                                onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)}
                                data-testid="upcoming-kind-filter"
                                className="border-input bg-background h-9 rounded-md border px-2 py-1.5 text-sm"
                            >
                                <option value="all">{TEXT.filterAll}</option>
                                <option value="interview">{TEXT.legend.interview}</option>
                                <option value="deadline">{TEXT.legend.deadline}</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto" data-testid="upcoming-list-scroll">
                        {upcomingEvents.length === 0 && <p className="text-muted-foreground text-sm">{TEXT.empty}</p>}
                        {upcomingEvents.map((event) => (
                            <EventRow key={event.id} event={event} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
