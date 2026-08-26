<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WitnessResource;
use App\Models\Investigation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WitnessController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return WitnessResource::collection($investigation->witnesses()->orderBy('id')->get());
    }
}
