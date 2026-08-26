<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Evidence extends Model
{
    /** @use HasFactory<\Database\Factories\EvidenceFactory> */
    use HasFactory;

    protected $table = 'evidence';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'investigation_id',
        'title',
        'type',
        'source',
        'date',
        'status',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'metadata' => 'array',
        ];
    }

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }

    /** @return BelongsToMany<Allegation, $this> */
    public function allegations(): BelongsToMany
    {
        return $this->belongsToMany(Allegation::class, 'allegation_evidence')->withPivot('relation');
    }
}
