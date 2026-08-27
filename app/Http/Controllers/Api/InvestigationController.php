<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvestigationRequest;
use App\Http\Requests\UpdateInvestigationRequest;
use App\Http\Resources\InvestigationResource;
use App\Models\Investigation;
use App\Models\InvestigationReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class InvestigationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $matters = Investigation::query()
            ->visibleTo($request->user())
            ->with(['client', 'investigator'])
            ->orderBy('reference_number')
            ->get();

        return InvestigationResource::collection($matters);
    }

    public function show(Investigation $investigation): InvestigationResource
    {
        return new InvestigationResource($investigation->load(['client', 'investigator']));
    }

    public function store(StoreInvestigationRequest $request): InvestigationResource
    {
        $data = $request->validated();

        $investigation = Investigation::create([
            'id' => 'inv-'.Str::lower(Str::random(8)),
            'reference_number' => $this->nextReferenceNumber(),
            'title' => $data['title'],
            'client_id' => $data['clientId'],
            'investigator_id' => $data['investigatorId'] ?? null,
            'type' => $data['type'],
            'status' => $data['status'],
            'priority' => $data['priority'],
            'opened_at' => $data['openedAt'],
            'target_completion_date' => $data['targetCompletionDate'],
            'description' => $data['description'],
        ]);

        InvestigationReport::create([
            'investigation_id' => $investigation->id,
            'included_sections' => [],
            'auto_fill' => [],
            'custom_sections' => [],
        ]);

        return new InvestigationResource($investigation->load(['client', 'investigator']));
    }

    public function update(UpdateInvestigationRequest $request, Investigation $investigation): InvestigationResource
    {
        $data = $request->validated();

        $changes = [];
        $fieldMap = [
            'title' => 'title',
            'clientId' => 'client_id',
            'investigatorId' => 'investigator_id',
            'type' => 'type',
            'status' => 'status',
            'priority' => 'priority',
            'openedAt' => 'opened_at',
            'targetCompletionDate' => 'target_completion_date',
            'description' => 'description',
        ];

        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $investigation->update($changes);

        $newStatus = $data['status'] ?? $investigation->status;
        if (in_array($newStatus, Investigation::CLOSED_STATUSES) && is_null($investigation->completed_at)) {
            $investigation->update(['completed_at' => now()]);
        } elseif (! in_array($newStatus, Investigation::CLOSED_STATUSES) && ! is_null($investigation->completed_at)) {
            $investigation->update(['completed_at' => null]);
        }

        return new InvestigationResource($investigation->fresh()->load(['client', 'investigator']));
    }

    public function destroy(Investigation $investigation): JsonResponse
    {
        $investigation->delete();

        return response()->json(status: 204);
    }

    private function nextReferenceNumber(): string
    {
        $lastNumber = Investigation::selectRaw('CAST(SUBSTRING(reference_number, 5) AS UNSIGNED) as num')
            ->orderByRaw('CAST(SUBSTRING(reference_number, 5) AS UNSIGNED) DESC')
            ->value('num');

        return 'INV-'.str_pad((int) ($lastNumber ?? 0) + 1, 4, '0', STR_PAD_LEFT);
    }
}
