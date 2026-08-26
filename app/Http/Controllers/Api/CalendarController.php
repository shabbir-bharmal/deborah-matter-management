<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Scheduled interviews plus the target completion date of every active
     * matter, in one chronological feed.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $visible = Investigation::query()->visibleTo($request->user());

        $interviews = Interview::query()
            ->whereIn('investigation_id', (clone $visible)->pluck('id'))
            ->whereIn('status', Interview::UPCOMING_STATUSES)
            ->with(['witness', 'investigation'])
            ->get()
            ->map(fn (Interview $interview): array => [
                'id' => 'interview-'.$interview->id,
                'kind' => 'interview',
                'date' => $interview->scheduled_at->format('Y-m-d'),
                'time' => $interview->scheduled_at->format('H:i'),
                'title' => 'Interview — '.($interview->witness?->name ?? 'Unknown witness'),
                'subtitle' => $interview->witness?->role ?? '',
                'reference' => $interview->investigation->reference_number,
                'href' => "/investigations/{$interview->investigation_id}/interviews",
            ]);

        $deadlines = (clone $visible)->active()->with('client')->get()
            ->map(fn (Investigation $matter): array => [
                'id' => 'deadline-'.$matter->id,
                'kind' => 'deadline',
                'date' => $matter->target_completion_date->format('Y-m-d'),
                'time' => null,
                'title' => 'Deadline — '.$matter->title,
                'subtitle' => $matter->client->name,
                'reference' => $matter->reference_number,
                'href' => "/investigations/{$matter->id}",
            ]);

        $events = $interviews->concat($deadlines)
            ->sortBy(fn (array $event): string => $event['date'].($event['time'] ?? ''))
            ->values();

        return response()->json(['data' => $events]);
    }
}
