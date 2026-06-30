<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class attribute_type extends Model
{
    protected $table = 'attribute_types';
    protected $primaryKey = 'id';
    protected $fillable = [
        'name',
    ];

    public function values()
    {
        return $this->hasMany(attribute_value::class, 'attribute_type_id');
    }
}
