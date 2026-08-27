<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAllegationRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', Rule::in([
                'harassment', 'discrimination', 'misconduct', 'retaliation',
                'policy_violation', 'conflict_of_interest', 'data_privacy',
                'fraud', 'safety_violation', 'substance_abuse', 'theft',
                'workplace_violence',
            ])],
            'status' => ['required', Rule::in(['pending', 'under_review', 'substantiated', 'not_substantiated', 'unfounded'])],
        ];
    }
}
