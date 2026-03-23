<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\Application;
use Phalcon\Autoload\Loader;
use Phalcon\Mvc\View;
use Phalcon\Mvc\Url;

ini_set('display_errors', 1);
error_reporting(E_ALL);

$di = new FactoryDefault();
\Phalcon\Di\Di::setDefault($di);

// Autoload
$loader = new Loader();
$loader->setDirectories([
    __DIR__ . '/../app/controllers/',
    __DIR__ . '/../app/models/',
]);
$loader->register();

// Router Service
$di->setShared('router', function () {
    return require __DIR__ . '/../app/config/router.php';
});

// View service
$di->set('view', function () {
    $view = new View();
    $view->setViewsDir(__DIR__ . '/../app/views/');
    return $view;
});

// URL service
$di->setShared('url', function () {
    $url = new Url();
    $url->setBaseUri('/');
    return $url;
});

$app = new Application($di);

// Use _url if rewrite works, else fallback to REQUEST_URI path
$uri = $_GET['_url'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$response = $app->handle($uri);
$response->send();

// echo $app->handle($uri)->getContent();
// echo $di->get('url')->getBaseUri(); base path is '/'