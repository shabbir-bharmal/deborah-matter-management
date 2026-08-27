<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvestigationRequest extends FormRequest
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
            'clientId' => ['sometimes', 'required', Rule::exists('clients', 'id')],
            'investigatorId' => ['sometimes', 'nullable', Rule::exists('users', 'id')],
            'type' => ['sometimes', 'required', Rule::in([
                'harassment', 'discrimination', 'misconduct', 'conflict_of_interest',
                'policy_violation', 'retaliation', 'data_privacy', 'theft',
                'substance_abuse', 'workplace_violence', 'safety_violation', 'fraud',
            ])],
            'status' => ['sometimes', 'required', Rule::in(['open', 'in_progress', 'review', 'completed', 'closed'])],
            'priority' => ['sometimes', 'required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'openedAt' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'targetCompletionDate' => ['sometimes', 'required', 'date', 'after_or_equal:openedAt'],
            'description' => ['sometimes', 'required', 'string'],
        ];
    }
}
