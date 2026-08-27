<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvestigationRequest extends FormRequest
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
            'clientId' => ['required', Rule::exists('clients', 'id')],
            'investigatorId' => ['nullable', Rule::exists('users', 'id')],
            'type' => ['required', Rule::in([
                'harassment', 'discrimination', 'misconduct', 'conflict_of_interest',
                'policy_violation', 'retaliation', 'data_privacy', 'theft',
                'substance_abuse', 'workplace_violence', 'safety_violation', 'fraud',
            ])],
            'status' => ['required', Rule::in(['open', 'in_progress', 'review', 'completed', 'closed'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'openedAt' => ['required', 'date', 'before_or_equal:today'],
            'targetCompletionDate' => ['required', 'date', 'after_or_equal:openedAt'],
            'description' => ['required', 'string'],
        ];
    }
}
