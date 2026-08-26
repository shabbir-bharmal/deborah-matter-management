<?php

namespace App\Http\Resources;

use App\Models\InvestigationReport;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin InvestigationReport
 */
class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'investigationId' => $this->investigation_id,
            'status' => $this->status,
            'title' => $this->title ?? '',
            'executiveSummary' => $this->executive_summary ?? '',
            'includedSections' => (object) ($this->included_sections ?? []),
            'autoFill' => (object) ($this->auto_fill ?? []),
            'customSections' => $this->custom_sections ?? [],
        ];
    }
}
