<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class attribute_value extends Model
{
    protected $table = 'attribute_values';
    protected $primaryKey = 'id';
    protected $fillable =[
        'attribute_type_id',
        'name',
    ];

    public function type()
    {
        return $this->belongsTo(attribute_type::class, 'attribute_type_id');
    }
}
