<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Witness extends Model
{
    /** @use HasFactory<\Database\Factories\WitnessFactory> */
    use HasFactory;

    protected $table = 'witnesses';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'investigation_id',
        'name',
        'role',
        'relationship',
        'interview_status',
        'interview_date',
        'notes',
    ];

    protected function casts(): array
    {
        return ['interview_date' => 'date'];
    }

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }

    /** @return HasMany<Interview, $this> */
    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    /** @return BelongsToMany<Allegation, $this> */
    public function allegations(): BelongsToMany
    {
        return $this->belongsToMany(Allegation::class, 'allegation_witness');
    }
}
