<?php

namespace App\Http\Controllers;

use App\Models\product_variant;
use App\Models\product_variant_value;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ProductVariantValueController extends Controller
{
    public function index()
    {
        $productVariantValues = product_variant_value::with(['variant.product', 'attributeValue.type'])->latest()->get();
        return response()->json(['productVariantValues' => $productVariantValues], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_variant_id' => ['required', 'exists:product_variants,id'],
            'attribute_value_id' => ['required', 'exists:attribute_values,id'],
        ]);

        try{
            if (Schema::hasColumn('product_variant_values', 'product_id')) {
                $data['product_id'] = product_variant::find($data['product_variant_id'])?->product_id;
            }
            $productVariantValue = product_variant_value::create($data);
            return response()->json(['productVariantValue' => $productVariantValue], 201);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id){
        $productVariantValue = product_variant_value::with(['variant.product', 'attributeValue.type'])->find($id);
        return response()->json(['productVariantValue' => $productVariantValue], 200);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'product_variant_id' => ['required', 'exists:product_variants,id'],
            'attribute_value_id' => ['required', 'exists:attribute_values,id'],
        ]);

        try {
            $productVariantValue = product_variant_value::find($id);
            if (!$productVariantValue) {
                return response()->json(['error' => 'Product Variant Value Not Found'], 404);
            }
            if (Schema::hasColumn('product_variant_values', 'product_id')) {
                $data['product_id'] = product_variant::find($data['product_variant_id'])?->product_id;
            }
            $productVariantValue->update($data);
            return response()->json(['productVariantValue' => $productVariantValue], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

    }

    public function destroy($id)
    {
        try {
            $productVariantValue = product_variant_value::find($id);
            if ($productVariantValue ){
                $productVariantValue->delete();
                return response()->json(['productVariantValue' => $productVariantValue], 200);
            }
            else{
                return response()->json(['error' => 'Product Variant Value Not Deleted'], 400);
            }
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

    }
}
