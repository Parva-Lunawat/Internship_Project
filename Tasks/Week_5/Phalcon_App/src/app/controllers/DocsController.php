<?php

use Phalcon\Mvc\Controller;

class DocsController extends Controller
{
    public function indexAction()
    {
        $this->view->disable();

        $html = <<<HTML
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
        });
      };
    </script>
  </body>
</html>
HTML;

        $this->response->setContentType('text/html', 'UTF-8');
        $this->response->setContent($html);
        return $this->response;
    }
}