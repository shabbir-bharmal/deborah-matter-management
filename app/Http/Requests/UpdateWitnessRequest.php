<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWitnessRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'role' => ['sometimes', 'required', 'string', 'max:255'],
            'relationship' => ['sometimes', 'required', Rule::in(['complainant', 'respondent', 'coworker', 'manager', 'third_party'])],
            'interviewStatus' => ['sometimes', 'required', Rule::in(['not_scheduled', 'scheduled', 'completed', 'cancelled', 'rescheduled'])],
            'interviewDate' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
