<?php

namespace App\Models;

use Database\Factories\AllegationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Allegation extends Model
{
    /** @use HasFactory<AllegationFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'investigation_id',
        'title',
        'description',
        'category',
        'status',
        'finding',
        'finding_notes',
    ];

    /** @return BelongsTo<Investigation, $this> */
    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }

    /** @return BelongsToMany<Witness, $this> */
    public function witnesses(): BelongsToMany
    {
        return $this->belongsToMany(Witness::class, 'allegation_witness');
    }

    /** @return BelongsToMany<Interview, $this> */
    public function interviews(): BelongsToMany
    {
        return $this->belongsToMany(Interview::class, 'allegation_interview');
    }

    /**
     * Evidence linked to this allegation, filtered by how it relates:
     * `related`, `supports` or `contradicts`.
     *
     * @return BelongsToMany<Evidence, $this>
     */
    public function evidence(): BelongsToMany
    {
        return $this->belongsToMany(Evidence::class, 'allegation_evidence')->withPivot('relation');
    }
}
