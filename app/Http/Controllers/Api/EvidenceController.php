<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvidenceResource;
use App\Models\Investigation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EvidenceController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return EvidenceResource::collection(
            $investigation->evidence()->with('allegations')->orderBy('date')->get()
        );
    }
}
