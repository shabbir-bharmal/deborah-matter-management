<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvidenceRequest extends FormRequest
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
            'type' => ['required', Rule::in(['email', 'document', 'chat_log', 'recording', 'photo', 'system_report'])],
            'source' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'status' => ['required', Rule::in(['received', 'in_review', 'reviewed', 'archived'])],
            'description' => ['required', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
