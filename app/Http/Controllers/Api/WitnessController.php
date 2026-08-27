<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWitnessRequest;
use App\Http\Requests\UpdateWitnessRequest;
use App\Http\Resources\WitnessResource;
use App\Models\Investigation;
use App\Models\Witness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class WitnessController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return WitnessResource::collection($investigation->witnesses()->orderBy('id')->get());
    }

    public function store(StoreWitnessRequest $request, Investigation $investigation): WitnessResource
    {
        $data = $request->validated();

        $witness = $investigation->witnesses()->create([
            'id' => 'wit-'.Str::lower(Str::random(8)),
            'name' => $data['name'],
            'role' => $data['role'],
            'relationship' => $data['relationship'],
            'interview_status' => $data['interviewStatus'],
            'interview_date' => $data['interviewDate'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return new WitnessResource($witness);
    }

    public function update(UpdateWitnessRequest $request, Investigation $investigation, Witness $witness): WitnessResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['name' => 'name', 'role' => 'role', 'relationship' => 'relationship', 'interviewStatus' => 'interview_status', 'interviewDate' => 'interview_date', 'notes' => 'notes'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $witness->update($changes);

        return new WitnessResource($witness->fresh());
    }

    public function destroy(Investigation $investigation, Witness $witness): JsonResponse
    {
        $witness->delete();

        return response()->json(status: 204);
    }
}
