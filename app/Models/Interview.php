<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Interview extends Model
{
    /** @use HasFactory<\Database\Factories\InterviewFactory> */
    use HasFactory;

    public const UPCOMING_STATUSES = ['scheduled', 'rescheduled'];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'investigation_id',
        'witness_id',
        'interviewer_id',
        'scheduled_at',
        'status',
        'notes',
        'transcript_excerpt',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'transcript_excerpt' => 'array',
        ];
    }

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }

    /** @return BelongsTo<Witness, $this> */
    public function witness(): BelongsTo
    {
        return $this->belongsTo(Witness::class);
    }

    /** @return BelongsTo<User, $this> */
    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    /** @return BelongsToMany<Allegation, $this> */
    public function allegations(): BelongsToMany
    {
        return $this->belongsToMany(Allegation::class, 'allegation_interview');
    }
}
