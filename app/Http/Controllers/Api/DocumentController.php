<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Investigation;
use App\Models\InvestigationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return DocumentResource::collection($investigation->documents()->orderBy('created_at')->get());
    }

    public function store(StoreDocumentRequest $request, Investigation $investigation): DocumentResource
    {
        $data = $request->validated();

        $document = $investigation->documents()->create([
            'id' => 'doc-'.Str::lower(Str::random(8)),
            'name' => $data['name'],
            'type' => $data['type'],
            'status' => $data['status'],
        ]);

        return new DocumentResource($document);
    }

    public function update(UpdateDocumentRequest $request, Investigation $investigation, InvestigationDocument $document): DocumentResource
    {
        $data = $request->validated();

        $changes = [];
        foreach (['name' => 'name', 'type' => 'type', 'status' => 'status'] as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $document->update($changes);

        return new DocumentResource($document->fresh());
    }

    public function destroy(Investigation $investigation, InvestigationDocument $document): JsonResponse
    {
        $document->delete();

        return response()->json(status: 204);
    }
}
