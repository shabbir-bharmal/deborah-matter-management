<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestigationResource;
use App\Models\Investigation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
}
