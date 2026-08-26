<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Investigation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocumentController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return DocumentResource::collection($investigation->documents()->orderBy('created_at')->get());
    }
}
