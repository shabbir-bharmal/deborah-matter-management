<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimelineEventResource;
use App\Models\Investigation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TimelineEventController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return TimelineEventResource::collection(
            $investigation->timelineEvents()->orderBy('date')->orderBy('id')->get()
        );
    }
}
