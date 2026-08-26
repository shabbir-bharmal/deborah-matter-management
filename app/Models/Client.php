<?php

namespace App\Models;

use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    protected $fillable = ['name', 'slug', 'contact_email'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return HasMany<Investigation, $this> */
    public function investigations(): HasMany
    {
        return $this->hasMany(Investigation::class);
    }
}
