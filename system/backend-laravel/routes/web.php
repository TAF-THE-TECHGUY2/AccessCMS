<?php

use Illuminate\Support\Facades\Route;

Route::get('/login', function () {
    return redirect('/admin/login');
})->name('login');

Route::get('/', function () {
    return view('welcome');
});
