<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Investigation;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function show(Investigation $investigation): ReportResource
    {
        return new ReportResource($investigation->report ?? $investigation->report()->create());
    }

    public function update(Request $request, Investigation $investigation): ReportResource
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:draft,final'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'executiveSummary' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'includedSections' => ['sometimes', 'array'],
            'autoFill' => ['sometimes', 'array'],
            'customSections' => ['sometimes', 'array'],
        ]);

        $report = $investigation->report ?? $investigation->report()->create();

        $columns = [
            'status' => 'status',
            'title' => 'title',
            'executiveSummary' => 'executive_summary',
            'includedSections' => 'included_sections',
            'autoFill' => 'auto_fill',
            'customSections' => 'custom_sections',
        ];

        $changes = [];
        foreach ($columns as $input => $column) {
            if (array_key_exists($input, $data)) {
                $changes[$column] = $data[$input];
            }
        }

        $report->update($changes);

        return new ReportResource($report);
    }
}
