<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInterviewRequest extends FormRequest
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
            'witnessId' => ['required', Rule::exists('witnesses', 'id')],
            'scheduledAt' => ['required', 'date'],
            'status' => ['required', Rule::in(['not_scheduled', 'scheduled', 'completed', 'cancelled', 'rescheduled'])],
            'interviewerId' => ['nullable', Rule::exists('users', 'id')],
            'notes' => ['nullable', 'string'],
        ];
    }
}
