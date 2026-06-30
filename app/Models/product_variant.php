<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class product_variant extends Model
{
    protected $table = "product_variants";
    protected $primaryKey = "id";
    protected $fillable = [
        'product_id',
        'name',
        'description',
        'price',
        'cost',
        'sku',
        'quantity',
    ];

    public function product()
    {
        return $this->belongsTo(product::class, 'product_id');
    }

    public function values()
    {
        return $this->hasMany(product_variant_value::class, 'product_variant_id');
    }
}
