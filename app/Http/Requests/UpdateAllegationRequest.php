<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAllegationRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'category' => ['sometimes', 'required', Rule::in([
                'harassment', 'discrimination', 'misconduct', 'retaliation',
                'policy_violation', 'conflict_of_interest', 'data_privacy',
                'fraud', 'safety_violation', 'substance_abuse', 'theft',
                'workplace_violence',
            ])],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'under_review', 'substantiated', 'not_substantiated', 'unfounded'])],
            'finding' => ['nullable', Rule::in(['substantiated', 'not_substantiated', 'unsubstantiated', 'inconclusive'])],
            'findingNotes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
