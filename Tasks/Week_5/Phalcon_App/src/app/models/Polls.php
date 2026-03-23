<?php

use function PHPSTORM_META\map;

class Polls
{
    private static $file = __DIR__ . '/../../storage/polls.json';
    public static function all()
    {
        if (!file_exists(self::$file)) {
            return [];
        }
        $content = file_get_contents(self::$file);
        if (empty($content)) {
            return [];
        }
        $data = json_decode($content, true);
        return $data ?? [];
    }
    public static function save($data)
    {
        file_put_contents(self::$file, json_encode($data, JSON_PRETTY_PRINT));
    }
    public static function create($title, $options)
    {
        $polls = self::all();
        $id = count($polls) + 1;
        $polls[] = [
            'id' => $id,
            'title' => $title,
            'options' => array_map(function ($option, $index) {
                return [
                    'id' => $index + 1,
                    'text' => $option,
                    'votes' => 0
                ];
            }, $options, array_keys($options)),
            'totalVotes' => 0
        ];
        self::save($polls);
    }
    public static function find($searchPollId)
    {
        foreach (self::all() as $poll) {
            if ($poll['id'] === (int)$searchPollId) {
                return $poll;
            }
        }
        return null;
    }
    public static function vote($pollId, $optionId) {
        $polls = self::all();

        foreach ($polls as &$poll) {
            if ($poll['id'] === (int)$pollId) {

                foreach ($poll['options'] as &$option) {
                    if ($option['id'] === (int)$optionId) {
                        $option['votes']++;
                        $poll['totalVotes']++;
                        break 2; // exit both loops
                    }
                }
            }
        }

        self::save($polls);
    }
    public static function delete($pollId) {
        $polls = self::all();
        $data = []; $index = 1;
        foreach($polls as $poll) {
            if ($poll['id'] !== (int)$pollId) {
                $data[] = $poll;
            }
        }
        foreach ($data as $poll) {
            $poll['id'] = $index;
            $index++;
        }
        self::save($data);
    }
}
