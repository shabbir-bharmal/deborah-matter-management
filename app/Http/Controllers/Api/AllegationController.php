<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAllegationRequest;
use App\Http\Requests\UpdateAllegationRequest;
use App\Http\Resources\AllegationResource;
use App\Models\Allegation;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class AllegationController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return AllegationResource::collection(
            $investigation->allegations()->with(['witnesses', 'evidence'])->get()
        );
    }

    public function store(StoreAllegationRequest $request, Investigation $investigation): AllegationResource
    {
        $data = $request->validated();

        $allegation = $investigation->allegations()->create([
            'id' => 'alg-'.Str::lower(Str::random(8)),
            'title' => $data['title'],
            'description' => $data['description'],
            'category' => $data['category'],
            'status' => $data['status'],
        ]);

        return new AllegationResource($allegation->load(['witnesses', 'evidence']));
    }

    public function update(UpdateAllegationRequest $request, Investigation $investigation, Allegation $allegation): AllegationResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['title' => 'title', 'description' => 'description', 'category' => 'category', 'status' => 'status', 'finding' => 'finding', 'findingNotes' => 'finding_notes'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $allegation->update($changes);

        return new AllegationResource($allegation->load(['witnesses', 'evidence']));
    }

    public function destroy(Investigation $investigation, Allegation $allegation): JsonResponse
    {
        $allegation->delete();

        return response()->json(status: 204);
    }
}
