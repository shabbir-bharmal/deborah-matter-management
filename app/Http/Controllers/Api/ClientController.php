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
use Illuminate\Support\Str;

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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
        ]);

        $client = Client::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'contact_email' => $validated['contactEmail'] ?? null,
        ]);

        return (new ClientResource($client->loadCount('investigations')->loadCount(['investigations as active_investigations_count' => fn ($query) => $query->active()])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
        ]);

        $client->update([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name'], $client->id),
            'contact_email' => $validated['contactEmail'] ?? null,
        ]);

        return (new ClientResource($client->loadCount('investigations')->loadCount(['investigations as active_investigations_count' => fn ($query) => $query->active()])))
            ->response();
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json(status: 204);
    }

    private function uniqueSlug(string $name, ?int $ignoreClientId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 2;

        while (
            Client::query()
                ->when($ignoreClientId !== null, fn ($query) => $query->whereKeyNot($ignoreClientId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
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
