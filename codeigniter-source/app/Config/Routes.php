<?php

namespace Config;

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// SECURE API SUBSCRIPTION ENDPOINTS
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    // Auth Nodes
    $routes->post('login', 'Api::login');
    $routes->post('register', 'Api::register');
    
    // License verification, state validations, device binds
    $routes->post('key/activate', 'Api::activateKey');
    $routes->post('key/verify', 'Api::verifyKey');
    $routes->post('device/reset', 'Api::resetDevice');
    
    // Profiles
    $routes->get('user/profile', 'Api::profile');
    $routes->get('user/history', 'Api::history');
});
