<?php

namespace App\Http\Controllers;

use App\Models\product_variant;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function index()
    {
        $productVariants = product_variant::with(['product', 'values.attributeValue.type'])->latest()->get();
        return response()->json(['productVariants' => $productVariants], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'sku' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $productVariant = product_variant::create($data);
            return response()->json(['productVariant' => $productVariant], 201);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function show($id)
    {
        $productVariant = product_variant::with(['product', 'values.attributeValue.type'])->find($id);
        return response()->json(['productVariant' => $productVariant], 200);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'sku' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'integer', 'min:0'],
        ]);

        try{
            $productVariant = product_variant::find($id);
            if (!$productVariant) {
                return response()->json(['error' => 'Product variant not found'], 404);
            }
            $productVariant->update($data);
            return response()->json(['productVariant' => $productVariant], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function destroy($id)
    {
        try{
            $productVariant = product_variant::find($id);
            if ( $productVariant){
                $productVariant->delete();
                return response()->json(['productVariant' => $productVariant], 200);
            }
            else{
                return response()->json(['error' => 'Product variant not deleted'], 400);
            }
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
