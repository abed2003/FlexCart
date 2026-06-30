<?php

use App\Http\Controllers\AttributeTypeController;
use App\Http\Controllers\AttributeValueController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductVariantValueController;
use Illuminate\Support\Facades\Route;

Route::apiResource('products', ProductController::class);
Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-variant-values', ProductVariantValueController::class);
Route::apiResource('attribute-types', AttributeTypeController::class);
Route::apiResource('attribute-values', AttributeValueController::class);
