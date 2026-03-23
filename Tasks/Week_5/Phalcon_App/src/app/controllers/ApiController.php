<?php

use Phalcon\Mvc\Controller;
use OpenApi\Annotations as OA;

/**
 * @OA\Info(title="Polls API", version="1.0.0")
 * @OA\Server(url="http://localhost:8080")
 */
class ApiController extends Controller
{
    // Helper Functions
    private function json($data, int $status = 200)
    {
        $this->response->setStatusCode($status);
        $this->response->setContentType("application/json", "UTF-8");
        $this->response->setJsonContent($data);
        return $this->response;
    }

    // GET Method functions
    /**
     * @OA\Get(
     *      path="/api/question",
     *      summary="List Polls",
     *      @OA\Response(response=200, description="OKAY")
     * )
     */
    public function indexAction()
    {
        if (!$this->request->isGet()) {
            return $this->json(["error" => "Incorrect method used"], $status = 404);
        }
        $data = Polls::all();
        return $this->json($data);
    }
    /**
     * @OA\Get(
     *      path="/api/question/view/{pollId}",
     *      summary="View poll by Id",
     *      @OA\Parameter(
     *          name="pollId",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(response=200, description="Okay"),
     *      @OA\Response(response=404, description="Not found")
     * )
     */
    public function viewAction($pollId)
    {
        if (!$this->request->isGet()) {
            return $this->json(["error" => "Poll not found"], $status = 500);
        }
        $data = Polls::find($pollId);
        if (!$data) {
            return $this->json(["error"=> "failed"], 500);
        }
        return $this->json($data);
    }

    // POST Method functions
    /**
     * @OA\Post(
     *      path="/api/question/create",
     *      summary="Create a poll",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title","options"},
     *              @OA\Property(property="title", type="string", example="Best backend framework?"),
     *              @OA\Property(
     *                  property="options",
     *                  type="array",
     *                  @OA\Items(type="string"),
     *                  example={"NestJS","Phalcon","Django"}
     *              )
     *          )
     *      ),
     *      @OA\Response(response=200, description="Created"),
     *      @OA\Response(response=422, description="Validation error")
     * )
     */
    public function createAction()
    {
        if (!$this->request->isPost()) {
            return $this->json(["error" => "Incorrect method used"], $status = 404);
        }
        $body = $this->request->getJsonRawBody(true);
        $title = $body['title'] ?? $this->request->getPost("title");
        $options = $body['options'] ?? $this->request->getPost("options");

        if (trim($title) === '' || !is_string($title)) {
            return $this->json(["error" => "Title is required"], status: 422);
        }
        if (!is_array($options)) {
            return $this->json(["error" => "options must be an array of strings"], status: 422);
        }
        $options = array_values(array_filter(array_map(function ($o) {
            return is_string($o) ? trim($o) : "";
        }, $options)));

        if (count($options) < 2) {
            return $this->json(["error" => "at least 2 non-empty options are required"], status: 422);
        }
        Polls::create($title, array_filter($options));

        return $this->json(["ok" => "Success"]);
    }

    /**
     * @OA\Post(
     *      path="/api/question/view/{pollId}/vote",
     *      summary="Vote the option",
     *      @OA\Parameter(
     *          name="pollId",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"optionId"},
     *              @OA\Property(property="optionId", type="integer", example=2)
     *          )
     *      ),
     *      @OA\Response(response=200, description="OK"),
     *      @OA\Response(response=422, description="Validation error")
     * )
     */
    public function voteAction($pollId, $optionId = null)
    {
        if (!$this->request->isPost()) {
            return $this->json(["error" => "Incorrect method used"], $status = 404);
        }
        $body = $this->request->getJsonRawBody(true) ?? [];
        $opt = $body['optionId'] ?? $optionId;
        if (!is_numeric($pollId) || !is_numeric($opt)) {
            return $this->json(["error" => "pollId and optionId must be numeric"], 422);
        }
        Polls::vote($pollId, $opt);
        return $this->json(["ok" => "Success"]);
    }
    /**
     * @OA\Delete(
     *      path="/api/question/{pollId}",
     *      summary="Delete a poll",
     *      description="Deletes the poll",
     *      @OA\Parameter(
     *          name="pollId",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(response=200, description="Deleted"),
     *      @OA\Response(response=404, description="Not found")
     * )
     */
    public function deleteAction($pollId)
    {
        if (!$this->request->isDelete()) {
            return $this->json(["error" => "Incorrect method used"], $status = 405);
        }
        $poll = Polls::find($pollId);
        if (!$poll) {
            return $this->json(["error"=> "Not Found Poll"], $status = 404);
        } 
        Polls::delete($pollId);
        return $this->json(["ok" => "Success"]);
    }
}
