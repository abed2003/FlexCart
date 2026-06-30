<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class product_variant_value extends Model
{
    protected $table = "product_variant_values";
    protected $fillable = [
        "product_variant_id",
        "product_id",
        "attribute_value_id",
    ];
    protected $primaryKey = "id";

    public function variant()
    {
        return $this->belongsTo(product_variant::class, 'product_variant_id');
    }

    public function attributeValue()
    {
        return $this->belongsTo(attribute_value::class, 'attribute_value_id');
    }
}
