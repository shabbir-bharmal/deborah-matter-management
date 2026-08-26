<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NoteResource;
use App\Models\Investigation;
use App\Models\MatterNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NoteController extends Controller
{
    public function index(Investigation $investigation): AnonymousResourceCollection
    {
        return NoteResource::collection($investigation->notes()->latest()->get());
    }

    public function store(Request $request, Investigation $investigation): NoteResource
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:5000']]);

        $note = $investigation->notes()->create([
            'user_id' => $request->user()->id,
            'author' => $request->user()->name,
            'body' => $data['body'],
        ]);

        return new NoteResource($note);
    }

    public function destroy(MatterNote $note): JsonResponse
    {
        $note->delete();

        return response()->json(status: 204);
    }
}
