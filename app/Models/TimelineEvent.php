<?php

namespace App\Models;

use Database\Factories\TimelineEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimelineEvent extends Model
{
    /** @use HasFactory<TimelineEventFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'investigation_id',
        'date',
        'type',
        'title',
        'description',
        'related_entity_type',
        'related_entity_id',
        'related_entity_label',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }
}
