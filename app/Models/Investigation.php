<?php

namespace App\Models;

use Database\Factories\InvestigationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Investigation extends Model
{
    /** @use HasFactory<InvestigationFactory> */
    use HasFactory;

    public const ACTIVE_STATUSES = ['open', 'in_progress', 'review'];

    public const CLOSED_STATUSES = ['completed', 'closed'];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'reference_number',
        'title',
        'client_id',
        'investigator_id',
        'type',
        'status',
        'priority',
        'opened_at',
        'target_completion_date',
        'completed_at',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'date',
            'target_completion_date' => 'date',
            'completed_at' => 'date',
        ];
    }

    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** @return BelongsTo<User, $this> */
    public function investigator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investigator_id');
    }

    /** @return HasMany<Allegation, $this> */
    public function allegations(): HasMany
    {
        return $this->hasMany(Allegation::class);
    }

    /** @return HasMany<Witness, $this> */
    public function witnesses(): HasMany
    {
        return $this->hasMany(Witness::class);
    }

    /** @return HasMany<Interview, $this> */
    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    /** @return HasMany<Evidence, $this> */
    public function evidence(): HasMany
    {
        return $this->hasMany(Evidence::class);
    }

    /** @return HasMany<TimelineEvent, $this> */
    public function timelineEvents(): HasMany
    {
        return $this->hasMany(TimelineEvent::class);
    }

    /** @return HasMany<InvestigationDocument, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(InvestigationDocument::class);
    }

    /** @return HasMany<MatterNote, $this> */
    public function notes(): HasMany
    {
        return $this->hasMany(MatterNote::class);
    }

    /** @return HasOne<InvestigationReport, $this> */
    public function report(): HasOne
    {
        return $this->hasOne(InvestigationReport::class);
    }

    /**
     * @param  Builder<Investigation>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereIn('status', self::ACTIVE_STATUSES);
    }

    /**
     * Portal users are scoped to their own client; staff users see everything.
     *
     * @param  Builder<Investigation>  $query
     */
    public function scopeVisibleTo(Builder $query, User $user): void
    {
        $query->when($user->client_id !== null, fn (Builder $scoped) => $scoped->where('client_id', $user->client_id));
    }
}
