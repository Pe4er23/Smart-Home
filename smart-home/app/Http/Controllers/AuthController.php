<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Метод входу
    public function login(Request $request)
    {
        // Перевіряємо, чи є такий користувач у базі
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            // Генеруємо секретний токен (перепустку)
            $token = $user->createToken('smart-home-token')->plainTextToken;
            
            return response()->json(['token' => $token, 'user' => $user]);
        }

        return response()->json(['message' => 'Невірний email або пароль'], 401);
    }

    // Метод виходу
    public function logout(Request $request)
    {
        // Видаляємо поточний токен
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Вийшли з системи']);
    }
}
