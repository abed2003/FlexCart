<?php

namespace App\Http\Controllers;

use App\Models\product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(){
        $products = product::with('variants')->latest()->get();
        return response()->json(['products' => $products], 200);
    }

    public function store(Request $request){
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        try {
            $product = product::create($data);
            return response()->json(['product' => $product], 201);
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id){
        $product = product::with('variants')->find($id);
        return response()->json(['product' => $product], 200);
    }
    public function update(Request $request, $id){
        $product = product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        else {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
            ]);

            try{
                $product->update($data);
                return response()->json(['product' => $product], 200);

            }catch (\Exception $e){
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }
    }

    public function destroy($id){
        $product = product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }else {
            try {
                $product->delete();
                return response()->json(['message' => 'Product deleted'], 200);
            }catch (\Exception $e){
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }
    }

}
