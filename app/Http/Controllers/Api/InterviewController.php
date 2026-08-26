<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InterviewResource;
use App\Models\Investigation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InterviewController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return InterviewResource::collection(
            $investigation->interviews()->with(['witness', 'interviewer', 'allegations'])->orderBy('scheduled_at')->get()
        );
    }
}
