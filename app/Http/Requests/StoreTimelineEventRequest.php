<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTimelineEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, Rule|string>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'type' => ['required', Rule::in(['intake', 'meeting', 'interview', 'evidence', 'review', 'milestone', 'correspondence'])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'relatedEntityType' => ['nullable', Rule::in(['witness', 'interview', 'evidence', 'allegation', 'document'])],
            'relatedEntityId' => ['nullable', 'string'],
            'relatedEntityLabel' => ['nullable', 'string', 'max:255'],
        ];
    }
}
