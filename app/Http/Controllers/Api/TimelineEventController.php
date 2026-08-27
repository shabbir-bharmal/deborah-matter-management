<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimelineEventRequest;
use App\Http\Requests\UpdateTimelineEventRequest;
use App\Http\Resources\TimelineEventResource;
use App\Models\Investigation;
use App\Models\TimelineEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class TimelineEventController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return TimelineEventResource::collection(
            $investigation->timelineEvents()->orderBy('date')->orderBy('id')->get()
        );
    }

    public function store(StoreTimelineEventRequest $request, Investigation $investigation): TimelineEventResource
    {
        $data = $request->validated();

        $event = $investigation->timelineEvents()->create([
            'id' => 'tl-'.Str::lower(Str::random(8)),
            'date' => $data['date'],
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'],
            'related_entity_type' => $data['relatedEntityType'] ?? null,
            'related_entity_id' => $data['relatedEntityId'] ?? null,
            'related_entity_label' => $data['relatedEntityLabel'] ?? null,
        ]);

        return new TimelineEventResource($event);
    }

    public function update(UpdateTimelineEventRequest $request, Investigation $investigation, TimelineEvent $timelineEvent): TimelineEventResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['date' => 'date', 'type' => 'type', 'title' => 'title', 'description' => 'description', 'relatedEntityType' => 'related_entity_type', 'relatedEntityId' => 'related_entity_id', 'relatedEntityLabel' => 'related_entity_label'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $timelineEvent->update($changes);

        return new TimelineEventResource($timelineEvent->fresh());
    }

    public function destroy(Investigation $investigation, TimelineEvent $timelineEvent): JsonResponse
    {
        $timelineEvent->delete();

        return response()->json(status: 204);
    }
}
