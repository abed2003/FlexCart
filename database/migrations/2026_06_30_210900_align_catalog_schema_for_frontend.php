<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('attribute_type') && ! Schema::hasTable('attribute_types')) {
            Schema::rename('attribute_type', 'attribute_types');
        }

        if (Schema::hasTable('attribute_value') && ! Schema::hasTable('attribute_values')) {
            Schema::rename('attribute_value', 'attribute_values');
        }

        if (Schema::hasTable('products_variants') && ! Schema::hasTable('product_variants')) {
            Schema::rename('products_variants', 'product_variants');
        }

        if (Schema::hasTable('products_variants_value') && ! Schema::hasTable('product_variant_values')) {
            Schema::rename('products_variants_value', 'product_variant_values');
        }

        if (Schema::hasTable('attribute_types') && ! Schema::hasColumn('attribute_types', 'created_at')) {
            Schema::table('attribute_types', function (Blueprint $table) {
                $table->timestamps();
            });
        }

        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (! Schema::hasColumn('product_variants', 'name')) {
                    $table->string('name')->nullable()->after('product_id');
                }

                if (! Schema::hasColumn('product_variants', 'description')) {
                    $table->string('description')->nullable()->after('name');
                }

                if (! Schema::hasColumn('product_variants', 'created_at')) {
                    $table->timestamps();
                }
            });

            DB::table('product_variants')
                ->whereNull('name')
                ->update(['name' => DB::raw("COALESCE(sku, CONCAT('Variant #', id))")]);
        }

        if (Schema::hasTable('product_variant_values')) {
            Schema::table('product_variant_values', function (Blueprint $table) {
                if (! Schema::hasColumn('product_variant_values', 'id')) {
                    $table->id()->first();
                }

                if (! Schema::hasColumn('product_variant_values', 'product_variant_id')) {
                    $table->foreignId('product_variant_id')->nullable()->after('id');
                }

                if (! Schema::hasColumn('product_variant_values', 'created_at')) {
                    $table->timestamps();
                }
            });
        }
    }

    public function down(): void
    {
        //
    }
};
