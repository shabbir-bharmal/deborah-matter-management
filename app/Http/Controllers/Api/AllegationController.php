<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AllegationResource;
use App\Models\Allegation;
use App\Models\Investigation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AllegationController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return AllegationResource::collection(
            $investigation->allegations()->with(['witnesses', 'evidence'])->get()
        );
    }

    /**
     * Records the investigator's finding for a single allegation.
     */
    public function update(Request $request, Allegation $allegation): AllegationResource
    {
        $data = $request->validate([
            'finding' => ['nullable', 'in:substantiated,not_substantiated,unsubstantiated,inconclusive'],
            'findingNotes' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', 'in:pending,under_review,substantiated,not_substantiated,unfounded'],
        ]);

        $changes = [];
        foreach (['finding' => 'finding', 'findingNotes' => 'finding_notes', 'status' => 'status'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $allegation->update($changes);

        return new AllegationResource($allegation->load(['witnesses', 'evidence']));
    }
}
