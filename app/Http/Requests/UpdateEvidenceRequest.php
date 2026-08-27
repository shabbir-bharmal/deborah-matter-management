<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEvidenceRequest extends FormRequest
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
            'type' => ['sometimes', 'required', Rule::in(['email', 'document', 'chat_log', 'recording', 'photo', 'system_report'])],
            'source' => ['sometimes', 'required', 'string', 'max:255'],
            'date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', Rule::in(['received', 'in_review', 'reviewed', 'archived'])],
            'description' => ['sometimes', 'required', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
