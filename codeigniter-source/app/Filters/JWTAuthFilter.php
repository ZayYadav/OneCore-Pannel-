<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JWTAuthFilter implements FilterInterface
{
    /**
     * Intercepts headers in request and validates JWT signature.
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getServer('HTTP_AUTHORIZATION');

        if (empty($authHeader)) {
            // Check for lowercase header as option
            $authHeader = $request->getServer('REDIRECT_HTTP_AUTHORIZATION') ?: $request->getServer('HTTP_AUTHORIZATION');
        }

        if (empty($authHeader)) {
            $response = service('response');
            return $response->setJSON([
                'status'  => 'error',
                'message' => 'Authorization token is missing. Access Denied.'
            ])->setStatusCode(401);
        }

        $tokenSegments = explode(' ', $authHeader);
        $token = isset($tokenSegments[1]) ? $tokenSegments[1] : null;

        if (!$token) {
            $response = service('response');
            return $response->setJSON([
                'status'  => 'error',
                'message' => 'Malformed authorization header. Use bearer format.'
            ])->setStatusCode(401);
        }

        try {
            $secretKey = env('JWT_SECRET_KEY', 'RAINBOW_SECURE_KEY_b8d3f1a26d9c4e7fb60718293c4e5a6f2b1d0c4d8e7a6f5b3c2e1d0f5c9e1b2a');
            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            
            // Attach decoded metadata to request registry
            $request->user = $decoded;
            
        } catch (Exception $e) {
            $response = service('response');
            return $response->setJSON([
                'status'  => 'error',
                'message' => 'Expired, invalid, or tampered authentication token: ' . $e->getMessage()
            ])->setStatusCode(401);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No post-processing steps
    }
}
