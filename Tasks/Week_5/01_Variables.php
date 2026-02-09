/* This Multiline comment was outside*/
<?php
// single line commment
/* Multiline comment */
$name = "Parva"; //string
$age = 32; // number
$isTrue = true; // boolean
$goldie = 19.923; //double / float
$isNull = null; // null
$arrayTrue = array(); // array

// Printing vars
echo $name . "<br>"; // concat is imp else not work
echo "hello myself " . $name . " aged: " . $age . " and something is" . $isTrue . "but wait this was boolean lets check false" . $isTrue;
echo "<br>better method of above {$name}<br>";
echo '<br>better method of above {$name}<br>';

//types
echo gettype($name) . "<br>";
echo gettype($isNull) . "<BR>"; //doesn't seem to be case sensitive

// printing again
print_r($name); // nope it is case sensitive can't say NAME
echo "<BR>";
var_dump($name); // give both type and then the variable

echo "<br>";
$name = 1234;
echo "{$name} {gettype($name)}" . "<br>"; // cant use function inside
echo "{$name} " . gettype($name) . "<br>";
echo "variables are dynamic by nature takes on whatever value we assgn typeScript was much better <BR> <hr>"; //aye other html tags work too
$string_sent = "hello my man you good?";
echo $string_sent . "<br>";
echo str_replace("good", "feelin well?", $string_sent);

// calculations
$x = 25;
$y = 2;
$z = $x + $y;
echo $z . "<br>";
echo $x - $y . "<br>";
echo $x * $y . "<br>";
echo $x / $y . "<br>"; // gives actual division not just the quotient unlike c;
echo $x % $y . "<br>";
echo $x ** $y . "<br>";
echo $y-- . " " . $y++ . " " . $y += 2; // post operation work system
echo "<br>";
// way too good function library 

// Conditional and operators
// == & === js style
// != is same as <>
// !==, <, <=, >=, >
// Logical are && || !

if ($age == "32") {
    print_r("Here did age == str(32) {$name} <br>");
}
if ($age === 32) {
    print_r(value: "Here did age === 32 {$name} <br>");
}

switch ($y) {
    case 1:
        print_r("1");
        break;
    case 2:
        print_r("2");
        break;
    case 3:
        print_r("3");
        break;
    case 4:
        print_r("4");
        break;
    default:
        print_r("good default here");
}
echo "<br>";
// arrays
// indexed
$fruits = ["apple", "banana", "cherry"];
echo $fruits[0] . " " . $fruits[1] . " " . $fruits[2] . "<br>";
$fruits[2] = "mango";
var_dump($fruits);
echo "<br>";

// mixed
$fruits = [1234, "what" . false . "no val rep for false", true];
echo $fruits[0] . " " . $fruits[1] . " " . $fruits[2] . "<br>";
$fruits[2] = "mango";
echo "<pre>";
var_dump($fruits);
echo "</pre>";

// associative
$user = [
    'name' => $name,
    'age' => "{$age}", // see what age has become as a type; it is now a string due to "";
    'hobbies' => 'tennis',
];
echo $user['name'] . "<br>";
echo "<pre>";
var_dump(($user));
echo "</pre>";

// loops
// for
for ($i = 0; $i <= 5; $i++) {
    echo $i . "<br>";
}
echo "<br>";
// while
$i = 1;
while ($i <= 5) {
    $z = $i ** $i;
    echo "{$z} <br>";
    $i++;
}

// foreach
$fruits = ["apple", "banana", "cherry"];

foreach ($fruits as $f) {
    echo $f . " is a good fruit <br>";
}
echo "<hr>";
echo "<br>";
// function
function sayNaruto()
{
    print_r("Dattebayo!!");
    print_r("Nigerundayou!!", return: true);
}
sayNaruto();
echo "<br>";
function saySasuke($naruto)
{
    echo "Naruto: Sasssuuuuuukkeeee!! <br>";
    echo "$naruto: Naaaarrrruuuuttooo!! <br>";
}
saySasuke("Sasuke");
function saySakura($caller = 'Sakura')
{
    if ($caller == "No one") {
        echo sayNaruto();
    } else {
        echo saySasuke("naruto");
    }
    echo "{$caller}: how are you?";
}
echo "<br><br>";
saySakura();
echo "<br><br>";
saySakura(caller: "No one");

echo "hi";






?>