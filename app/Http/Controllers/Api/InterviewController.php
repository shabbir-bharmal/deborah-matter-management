<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInterviewRequest;
use App\Http\Requests\UpdateInterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class InterviewController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return InterviewResource::collection(
            $investigation->interviews()->with(['witness', 'interviewer', 'allegations'])->orderBy('scheduled_at')->get()
        );
    }

    public function store(StoreInterviewRequest $request, Investigation $investigation): InterviewResource
    {
        $data = $request->validated();

        $interview = $investigation->interviews()->create([
            'id' => 'int-'.Str::lower(Str::random(8)),
            'witness_id' => $data['witnessId'],
            'interviewer_id' => $data['interviewerId'] ?? null,
            'scheduled_at' => $data['scheduledAt'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return new InterviewResource($interview->load(['witness', 'interviewer']));
    }

    public function update(UpdateInterviewRequest $request, Investigation $investigation, Interview $interview): InterviewResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['witnessId' => 'witness_id', 'scheduledAt' => 'scheduled_at', 'status' => 'status', 'interviewerId' => 'interviewer_id', 'notes' => 'notes'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $interview->update($changes);

        return new InterviewResource($interview->fresh()->load(['witness', 'interviewer']));
    }

    public function destroy(Investigation $investigation, Interview $interview): JsonResponse
    {
        $interview->delete();

        return response()->json(status: 204);
    }
}
