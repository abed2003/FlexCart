<?php

namespace App\Http\Controllers;

use App\Models\attribute_type;
use Illuminate\Http\Request;

class AttributeTypeController extends Controller
{
    public function index(){
        $attributeTypes = attribute_type::with('values')->latest()->get();
        return response()->json(['attributeTypes' => $attributeTypes], 200);
    }

    public function store (Request $request){
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $attributeType = attribute_type::create($data);
        return response()->json(['attributeType' => $attributeType], 201);
    }

    public function update (Request $request, $id){
        $attributeType  = attribute_type::find($id);
        if ( !$attributeType) {
            return response()->json(['message' => 'not found'], 404);
        }else {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ]);

            try {
                $attributeType->update($data);
                return response()->json(['attributeType' => $attributeType], 200);
            }catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function destroy($id){
        $attributeType  = attribute_type::find($id);
        if( !$attributeType) {
            return response()->json(['message' => 'not found'], 404);
        }else {
            try {
                $attributeType->delete();
                return response()->json(['message' => 'Attribute Type Deleted Successfully'], 200);
            }catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }

        }
    }

    public function show($id){
        $attributeType = attribute_type::with('values')->find($id);
        return response()->json(['attributeType' => $attributeType], 200);
    }
}
