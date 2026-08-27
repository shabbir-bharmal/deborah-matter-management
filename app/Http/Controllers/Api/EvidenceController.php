<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvidenceRequest;
use App\Http\Requests\UpdateEvidenceRequest;
use App\Http\Resources\EvidenceResource;
use App\Models\Evidence;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class EvidenceController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return EvidenceResource::collection(
            $investigation->evidence()->with('allegations')->orderBy('date')->get()
        );
    }

    public function store(StoreEvidenceRequest $request, Investigation $investigation): EvidenceResource
    {
        $data = $request->validated();

        $evidence = $investigation->evidence()->create([
            'id' => 'evd-'.Str::lower(Str::random(8)),
            'title' => $data['title'],
            'type' => $data['type'],
            'source' => $data['source'],
            'date' => $data['date'],
            'status' => $data['status'],
            'description' => $data['description'],
            'metadata' => $data['metadata'] ?? [],
        ]);

        return new EvidenceResource($evidence->load('allegations'));
    }

    public function update(UpdateEvidenceRequest $request, Investigation $investigation, Evidence $evidence): EvidenceResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['title' => 'title', 'type' => 'type', 'source' => 'source', 'date' => 'date', 'status' => 'status', 'description' => 'description', 'metadata' => 'metadata'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $evidence->update($changes);

        return new EvidenceResource($evidence->fresh()->load('allegations'));
    }

    public function destroy(Investigation $investigation, Evidence $evidence): JsonResponse
    {
        $evidence->delete();

        return response()->json(status: 204);
    }
}
