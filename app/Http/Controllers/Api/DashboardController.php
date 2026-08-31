<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InterviewResource;
use App\Http\Resources\TimelineEventResource;
use App\Models\Allegation;
use App\Models\Evidence;
use App\Models\Interview;
use App\Models\Investigation;
use App\Models\TimelineEvent;
use App\Models\Witness;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    private const STATUSES = ['open', 'in_progress', 'review', 'completed', 'closed'];

    private const PRIORITIES = ['critical', 'high', 'medium', 'low'];

    public function __invoke(Request $request): JsonResponse
    {
        $today = Carbon::today()->toDateString();
        $visible = Investigation::query()->visibleTo($request->user());
        $visibleIds = (clone $visible)->pluck('id');
        $activeIds = (clone $visible)->active()->pluck('id');

        $upcoming = Interview::query()
            ->select('id', 'investigation_id', 'witness_id', 'scheduled_at')
            ->with('investigation:reference_number','witness:id,name')
            ->whereIn('investigation_id', $visibleIds)
            ->whereIn('status', Interview::UPCOMING_STATUSES)
            ->whereDate('scheduled_at', '>=', $today)
            ->with(['witness', 'interviewer', 'investigation'])
            ->orderBy('scheduled_at')
            ->limit(6)
            ->get();

        $recent = TimelineEvent::query()
            ->select('id', 'investigation_id', 'type', 'title')
            ->with(['investigation:id,reference_number'])
            ->whereIn('investigation_id', $visibleIds)
            ->with('investigation')
            ->orderByDesc('date')
            ->limit(6)
            ->get();

        return response()->json([
            'data' => [
                'activeMatterCount' => $activeIds->count(),
                'completedMatterCount' => (clone $visible)->whereIn('status', Investigation::CLOSED_STATUSES)->count(),
                'overdueMatterCount' => (clone $visible)->active()->whereDate('target_completion_date', '<', $today)->count(),
                'statusCounts' => $this->counts($visible, 'status', self::STATUSES),
                'priorityCounts' => $this->counts((clone $visible)->active(), 'priority', self::PRIORITIES),
                'upcomingInterviews' => $upcoming->map(fn (Interview $interview) => [
                    ...[
                        'id' => $interview->id,
                        'investigationId' => $interview->investigation_id,
                        'witnessName' => $interview->witness?->name,
                        'scheduledAt' => $interview->scheduled_at->format('Y-m-d\TH:i:s')
                    ],
                    'investigationReference' => $interview->investigation?->reference_number,
                ]),
                'recentActivity' => $recent->map(fn (TimelineEvent $event) => [
                    'event' => [
                        'id' => $event->id,
                        'investigationId' => $event->investigation_id,
                        'title' => $event->title,
                        'type' => $event->type,
                    ],
                    'investigationReference' => $event->investigation->reference_number,
                ]),
                'pendingActions' => [
                    [
                        'id' => 'allegations-awaiting-review',
                        'label' => 'Allegations awaiting review',
                        'count' => Allegation::whereIn('investigation_id', $activeIds)->whereIn('status', ['pending', 'under_review'])->count(),
                    ],
                    [
                        'id' => 'evidence-to-review',
                        'label' => 'Evidence items to review',
                        'count' => Evidence::whereIn('investigation_id', $activeIds)->whereIn('status', ['received', 'in_review'])->count(),
                    ],
                    [
                        'id' => 'witnesses-unscheduled',
                        'label' => 'Witnesses awaiting scheduling',
                        'count' => Witness::whereIn('investigation_id', $activeIds)->where('interview_status', 'not_scheduled')->count(),
                    ],
                ],
            ],
        ]);
    }

    /**
     * @param  Builder<Investigation>  $query
     * @param  list<string>  $values
     * @return list<array{status?: string, priority?: string, count: int}>
     */
    private function counts($query, string $column, array $values): array
    {
        $counts = (clone $query)->groupBy($column)->selectRaw("{$column}, count(*) as aggregate")->pluck('aggregate', $column);

        return array_map(fn (string $value): array => [
            $column => $value,
            'count' => (int) ($counts[$value] ?? 0),
        ], $values);
    }
}
