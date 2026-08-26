<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestigationReport extends Model
{
    /** @use HasFactory<\Database\Factories\InvestigationReportFactory> */
    use HasFactory;

    protected $fillable = [
        'investigation_id',
        'status',
        'title',
        'executive_summary',
        'included_sections',
        'auto_fill',
        'custom_sections',
    ];

    protected $attributes = [
        'included_sections' => '{}',
        'auto_fill' => '{}',
        'custom_sections' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'included_sections' => 'array',
            'auto_fill' => 'array',
            'custom_sections' => 'array',
        ];
    }

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }
}
