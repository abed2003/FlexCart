<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    protected $fillable = [
        'name',
        'description',
    ];

    public function variants()
    {
        return $this->hasMany(product_variant::class, 'product_id');
    }
}
