<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak aktif. Hubungi administrator.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('hris-msr-token')->plainTextToken;
        $user->load('employee');

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'user' => $this->transformUser($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');

        return response()->json([
            'success' => true,
            'user' => $this->transformUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama tidak sesuai.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah. Silakan login kembali.',
        ]);
    }

    private function transformUser(User $user): array
    {
        $employee = $user->employee;
        $faceImageUrl = $employee?->face_image ? asset('storage/' . $employee->face_image) : null;
        $photoUrl = $faceImageUrl ?: ($employee?->photo ? asset('storage/' . $employee->photo) : null);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
            'employee' => $employee ? [
                'id' => $employee->id,
                'employee_number' => $employee->employee_number,
                'department' => $employee->department,
                'position' => $employee->position,
                'photo' => $employee->photo,
                'photo_url' => $photoUrl,
                'face_image' => $employee->face_image,
                'face_image_url' => $faceImageUrl,
                'face_registered_at' => $employee->face_registered_at,
                'is_face_registered' => !empty($employee->face_image),
            ] : null,
            'department' => $employee?->department,
            'position' => $employee?->position,
            'employee_number' => $employee?->employee_number,
            'photo' => $photoUrl,
            'photo_url' => $photoUrl,
            'face_image_url' => $faceImageUrl,
            'is_face_registered' => !empty($employee?->face_image),
        ];
    }
}
