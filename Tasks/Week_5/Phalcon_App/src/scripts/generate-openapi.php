<?php

require __DIR__ . '/../vendor/autoload.php';

$generator = new \OpenApi\Generator();

// Scan only your API controller file (as you wanted)
$openapi = $generator->generate([
    __DIR__ . '/../app/controllers/ApiController.php',
]);

file_put_contents(__DIR__ . '/../public/openapi.json', $openapi->toJson());

echo "Generated: public/openapi.json\n";