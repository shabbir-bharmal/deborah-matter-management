<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evidence;
use App\Models\Interview;
use App\Models\Investigation;
use App\Models\InvestigationDocument;
use App\Models\TimelineEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Derived notifications — the eight most recent things worth a badge.
     * Read state stays client-side; nothing here is persisted per user.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $visible = Investigation::query()->visibleTo($request->user());
        $visibleIds = (clone $visible)->pluck('id');
        $notifications = collect();

        Interview::query()
            ->whereIn('investigation_id', $visibleIds)
            ->whereIn('status', Interview::UPCOMING_STATUSES)
            ->with(['witness', 'investigation'])
            ->get()
            ->each(function (Interview $interview) use ($notifications): void {
                $notifications->push([
                    'id' => 'interview-'.$interview->id,
                    'kind' => 'interview',
                    'title' => 'Interview '.($interview->status === 'rescheduled' ? 'rescheduled' : 'scheduled').' — '.($interview->witness?->name ?? 'witness'),
                    'description' => $interview->investigation->reference_number.' · '.$interview->scheduled_at->format('j M, H:i'),
                    'date' => $interview->scheduled_at->toIso8601String(),
                    'href' => "/matters/{$interview->investigation_id}/interviews",
                ]);
            });

        Evidence::query()
            ->whereIn('investigation_id', $visibleIds)
            ->whereIn('status', ['received', 'in_review'])
            ->with('investigation')
            ->get()
            ->each(function (Evidence $item) use ($notifications): void {
                $notifications->push([
                    'id' => 'evidence-'.$item->id,
                    'kind' => 'evidence',
                    'title' => $item->status === 'received' ? 'New evidence awaiting review' : 'Evidence review in progress',
                    'description' => $item->title.' · '.$item->investigation->reference_number,
                    'date' => $item->date->toIso8601String(),
                    'href' => "/matters/{$item->investigation_id}/evidence",
                ]);
            });

        InvestigationDocument::query()
            ->whereIn('investigation_id', $visibleIds)
            ->where('type', 'report')
            ->where('status', 'draft')
            ->with('investigation')
            ->get()
            ->each(function (InvestigationDocument $document) use ($notifications): void {
                $notifications->push([
                    'id' => 'report-'.$document->id,
                    'kind' => 'report',
                    'title' => 'Report draft ready',
                    'description' => $document->name.' · '.$document->investigation->reference_number,
                    'date' => $document->created_at->toIso8601String(),
                    'href' => "/matters/{$document->investigation_id}/reports",
                ]);
            });

        (clone $visible)->active()->get()->each(function (Investigation $matter) use ($notifications): void {
            $latest = TimelineEvent::where('investigation_id', $matter->id)->orderByDesc('date')->first();

            if ($latest) {
                $notifications->push([
                    'id' => 'milestone-'.$latest->id,
                    'kind' => 'milestone',
                    'title' => $matter->reference_number.' update',
                    'description' => $latest->title,
                    'date' => $latest->date->toIso8601String(),
                    'href' => "/matters/{$matter->id}/timeline",
                ]);
            }
        });

        return response()->json([
            'data' => $notifications->sortByDesc('date')->take(8)->values(),
        ]);
    }
}
