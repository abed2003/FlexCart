<?php

namespace App\Http\Controllers;

use App\Models\attribute_value;
use Illuminate\Http\Request;

class AttributeValueController extends Controller
{
    public function index () {
        $attributeValues = attribute_value::with('type')->latest()->get();
        return response()->json(['attributeValues' => $attributeValues], 200);
    }

    public function store (Request $request) {
        $validated = $request->validate([
            'attribute_type_id' => ['required', 'exists:attribute_types,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $attributeValue = attribute_value::create($validated);
        return response()->json(['attributeValue' => $attributeValue], 201);
    }

    public function update (Request $request, $id) {
        $validated = $request->validate([
            'attribute_type_id' => ['required', 'exists:attribute_types,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $attributeValue = attribute_value::find($id);
        if (!$attributeValue) {
            return response()->json(['message' => 'not found'], 404);
        }
        $attributeValue->update($validated);
        return response()->json(['attributeValue' => $attributeValue], 200);
    }

    public function destroy ($id) {
        $attributeValue = attribute_value::find($id);
        if (!$attributeValue) {
            return response()->json(['message' => 'not found'], 404);
        }
        $attributeValue->delete();
        return response()->json(['attributeValue' => $attributeValue], 200);
    }

    public function show ($id) {
        $attribute_value = attribute_value::find($id);
        return response()->json(['attributeValue' => $attribute_value], 200);
    }
}

