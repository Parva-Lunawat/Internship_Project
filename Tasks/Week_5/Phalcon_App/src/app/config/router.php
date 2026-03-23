<?php

use Phalcon\Mvc\Router;

$router = new Router(false);
$router->removeExtraSlashes(true);

// Api Controller
$router->addGet('/api/question', [
    'controller' => 'api',
    'action'     => 'index',
]);

$router->addGet('/api/question/view/{pollId:[0-9]+}', [
    'controller' => 'api',
    'action'     => 'view',
    'pollId'     => 1,
]);

$router->addPost('/api/question/create', [
    'controller' => 'api',
    'action'     => 'create',
]);

$router->addPost('/api/question/view/{pollId:[0-9]+}/vote', [
    'controller' => 'api',
    'action'     => 'vote',
    'pollId'     => 1,
]);

// deleteAction uses POST in your controller
$router->addDelete('/api/question/{pollId:[0-9]+}', [
    'controller' => 'api',
    'action'     => 'delete',
    'pollId'     => 1,
]);

$router->addGet('/api-docs', [
  'controller' => 'docs',
  'action' => 'index',
]);

// Question Controller
$router->addGet('/question', [
    'controller' => 'question',
    'action'     => 'index',
]);

$router->add('/question/create', [
    'controller' => 'question',
    'action'     => 'create',
]);

$router->addGet('/question/view/{pollId:[0-9]+}', [
    'controller' => 'question',
    'action'     => 'view',
]);

$router->addPost('/question/vote/{pollId:[0-9]+}/{optionId:[0-9]+}', [
    'controller' => 'question',
    'action'     => 'vote',
]);

$router->addDelete('/question/{pollId:[0-9]+}', [
    'controller' => 'question',
    'action'     => 'delete',
]);


return $router;