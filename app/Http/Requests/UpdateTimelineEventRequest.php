<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTimelineEventRequest extends FormRequest
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
            'date' => ['sometimes', 'required', 'date'],
            'type' => ['sometimes', 'required', Rule::in(['intake', 'meeting', 'interview', 'evidence', 'review', 'milestone', 'correspondence'])],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'relatedEntityType' => ['nullable', Rule::in(['witness', 'interview', 'evidence', 'allegation', 'document'])],
            'relatedEntityId' => ['nullable', 'string'],
            'relatedEntityLabel' => ['nullable', 'string', 'max:255'],
        ];
    }
}
