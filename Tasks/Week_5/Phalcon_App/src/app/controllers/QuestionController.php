<?php

use Phalcon\Mvc\Controller;

class QuestionController extends Controller
{
    public function indexAction()
    {
        $this->view->polls = Polls::all();
    }
    public function createAction()
    {
        if ($this->request->isPost()) {
            $title = $this->request->getPost("title");
            $options = $this->request->getPost("options");
            Polls::create($title, array_filter($options));

            return $this->response->redirect($this->url->get('question'));
        }
    }
    public function viewAction($pollId)
    {
        $this->view->poll = Polls::find($pollId);
    }

    public function voteAction($pollId, $optionId)
    {
        if ($this->request->isPost()) {
            Polls::vote($pollId, $optionId);
            return $this->response->redirect($this->url->get("question/"));
        }
        return $this->response->redirect($this->url->get("question/" . $pollId));
    }
    
    public function deleteAction($pollId)
    {
        if (!$this->request->isDelete()) {
            return $this->response->setStatusCode(405, "Method Not Allowed");
        }

        $poll = Polls::find($pollId);

        if (!$poll) {
            return $this->response->setStatusCode(404, "Poll Not Found");
        }

        Polls::delete($pollId);

        return $this->response->redirect($this->url->get("question/"));
    }
}


// Code to convert this backend to API 
// <?php

// use Phalcon\Mvc\Controller;

// class QuestionController extends Controller
// {
//     // Helper Functions
//     private function json($data, int $status = 200)
//     {
//         $this->response->setStatusCode($status);
//         $this->response->setContentType("application/json", "UTF-8");
//         $this->response->setJsonContent($data);
//         return $this->response;
//     }

//     // GET Method functions
//     public function indexAction()
//     {
//         if (!$this->request->isGet()) {
//             return $this->json(["error" => "Incorrect method used"], $status = 404);
//         }
//         $data = Polls::all();
//         return $this->json($data);
//     }
//     public function viewAction($pollId)
//     {
//         if (!$this->request->isGet()) {
//             return $this->json(["error" => "Incorrect method used"], $status = 404);
//         }
//         $data = Polls::find($pollId);
//         if (!$data) {
//             return $this->json(["error"=> "failed"], 500);
//         }
//         return $this->json($data);
//     }

//     // POST Method functions
//     public function createAction()
//     {
//         if (!$this->request->isPost()) {
//             return $this->json(["error" => "Incorrect method used"], $status = 404);
//         }
//         $body = $this->request->getJsonRawBody(true);
//         $title = $body['title'] ?? $this->request->getPost("title");
//         $options = $body['options'] ?? $this->request->getPost("options");

//         if (trim($title) === '' || !is_string($title)) {
//             return $this->json(["error" => "Title is required"], status: 404);
//         }
//         if (!is_array($options)) {
//             return $this->json(["error" => "options must be an array of strings"], 422);
//         }
//         $options = array_values(array_filter(array_map(function ($o) {
//             return is_string($o) ? trim($o) : "";
//         }, $options)));

//         if (count($options) < 2) {
//             return $this->json(["error" => "at least 2 non-empty options are required"], status: 422);
//         }
//         Polls::create($title, array_filter($options));

//         return $this->json(["ok" => "Success"]);
//     }

//     public function voteAction($pollId, $optionId = null)
//     {
//         if (!$this->request->isPost()) {
//             return $this->json(["error" => "Incorrect method used"], $status = 404);
//         }
//         $body = $this->request->getJsonRawBody(true) ?? [];
//         $opt = $body['optionId'] ?? $optionId;
//         if (!is_numeric($pollId) || !is_numeric($opt)) {
//             return $this->json(["error" => "pollId and optionId must be numeric"], 422);
//         }
//         Polls::vote($pollId, $opt);
//         return $this->json(["ok" => "Success"]);
//     }
//     public function deleteAction($pollId)
//     {
//         if (!$this->request->isPost()) {
//             return $this->json(["error" => "Incorrect method used"], $status = 404);
//         }
//         $poll = Polls::find($pollId);
//         if (!$poll) {
//             return $this->json(["error"=> "Not Found Poll"], $status = 404);
//         } 
//         Polls::delete($pollId);
//         return $this->json(["ok" => "Success"]);
//     }
// }
