<?php
ob_start();
echo "<pre>";
// var_dump($_SERVER);
// echo "<pre /><hr>";
// var_dump($_GET);
// echo "<hr>";
// var_dump($_COOKIE);
var_dump($_FILES);

$uploadsDir = 'uploads/';
$contactsFile = 'contacts.json';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = filter_input(INPUT_POST, "Name", FILTER_SANITIZE_SPECIAL_CHARS);
    $image = filter_input(INPUT_POST, "image");

    $filters = array(
        "Email" => array(
            "filter" => FILTER_VALIDATE_EMAIL
        ),
        "Mobile" => array(
            "filter" => FILTER_VALIDATE_INT,
            "options" => array(
                "min_range" => 999999999,
                "max_range" => 9999999999
            ),
        ),
    );
    $filtered_input = filter_input_array(INPUT_POST, $filters);

    $email = $filtered_input["Email"];
    $mobile = $filtered_input["Mobile"];

    if ($name && $email !== false && $mobile !== false && isset($_FILES['image'])) {
        var_dump("Name: $name", "Email: $email", "Mobile: $mobile", "Image: $image");
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }
        $imageName = time() . "_" . uniqid() . "_" . basename($_FILES["image"]["name"]);
        $imagePath = $uploadsDir . $imageName;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $imagePath)) {
            $contacts = file_exists($contactsFile) ?
                json_decode(file_get_contents($contactsFile), true) :
                [];

            // appends the data
            $emails = array_column($contacts, 'email');
            if (!in_array($email, $emails)) {
                $contacts[] = [
                    'name' => $name,
                    'email' => $email,
                    'mobile' => $mobile,
                    'image' => $imagePath
                ];
                var_dump("SUCCESS: Data is valid. <br>Contact added");
            } else {
                var_dump("ALready exists!!");
            }
            file_put_contents($contactsFile, json_encode($contacts), JSON_PRETTY_PRINT);
            header('Location: index.php');
            exit;
        } else {
            header("Location: " . $_SERVER['HTTP_REFERER']);
            exit;
        }
    } else {
        var_dump("INVALID: Check your email format or mobile range.");
        header("Location: " . $_SERVER['HTTP_REFERER']);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <form action="" method="post" enctype="multipart/form-data">
        <label>Name: </label>
        <input type="text" name="Name" required />
        <br>

        <label>Email: </label>
        <input type="email" name="Email" required />
        <br>

        <label>Mobile: </label>
        <input type="number" name="Mobile" required />

        <label>Image: </label>
        <input type="file" name="image" accept="image/*" required />

        <br>

        <button type="submit">Add Contact</button>
    </form>
</body>

</html>