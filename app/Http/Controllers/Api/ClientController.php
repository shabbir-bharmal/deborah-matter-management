<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\InterviewResource;
use App\Http\Resources\InvestigationResource;
use App\Http\Resources\TimelineEventResource;
use App\Models\Client;
use App\Models\Interview;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    /** Stage shown on the client portal progress bar, per matter status. */
    private const STAGE_BY_STATUS = [
        'open' => 0,
        'in_progress' => 2,
        'review' => 3,
        'completed' => 4,
        'closed' => 4,
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $clients = Client::query()
            ->when($request->user()->client_id !== null, fn ($query) => $query->whereKey($request->user()->client_id))
            ->withCount('investigations')
            ->withCount(['investigations as active_investigations_count' => fn ($query) => $query->active()])
            ->orderBy('name')
            ->get();

        return ClientResource::collection($clients);
    }

    /**
     * The client portal view: matter status, milestones and client-visible
     * documents only.
     */
    public function show(Request $request, Client $client): JsonResponse
    {
        abort_if($request->user()->client_id !== null && $request->user()->client_id !== $client->id, 403);

        $matters = Investigation::query()
            ->where('client_id', $client->id)
            ->with(['client', 'investigator'])
            ->orderBy('reference_number')
            ->get();

        return response()->json([
            'data' => [
                'id' => $client->slug,
                'name' => $client->name,
                'matters' => $matters->map(fn (Investigation $matter) => [
                    ...(new InvestigationResource($matter))->toArray($request),
                    'stageIndex' => self::STAGE_BY_STATUS[$matter->status] ?? 0,
                    'upcomingInterviews' => InterviewResource::collection(
                        $matter->interviews()
                            ->whereIn('status', Interview::UPCOMING_STATUSES)
                            ->with(['witness', 'interviewer'])
                            ->orderBy('scheduled_at')
                            ->get()
                    )->toArray($request),
                    'sharedDocuments' => DocumentResource::collection(
                        $matter->documents()->where('status', 'shared')->get()
                    )->toArray($request),
                    'latestEvent' => ($latest = $matter->timelineEvents()->orderByDesc('date')->first())
                        ? (new TimelineEventResource($latest))->toArray($request)
                        : null,
                ]),
            ],
        ]);
    }
}
