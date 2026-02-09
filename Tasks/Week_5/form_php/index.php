<?php
$contactsFile = 'contacts.json';
$contacts = file_exists($contactsFile) ? 
    json_decode(file_get_contents($contactsFile), true) :
    [];

// require 'vendor/autoload.php';
// use GuzzleHTTP\Client;
// $client = new Client();
// $response = $client->request('GET', 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr');
// $body = $response->getbody();
// $data = json_decode($body, true);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <a href="create.php">Click to Add Contact</a>
    <h1>Contacts: </h1><br>
    <ul>
        <?php foreach ($contacts as $contact): ?>
            <ul>
                <div>
                    <img src="<?php echo $contact['image']; ?>" height="50">
                    <?php echo "{$contact['name']} - {$contact['email']} - {$contact['mobile']}"; ?>
                    <a href="delete.php?name=<?php echo $contact['name']?>">
                        Delete
                    </a>
                </div>
            </ul>
            <?php endforeach; ?>
            <!-- <h3>BITCOIN PRICE: <?php echo data->bitcoin->inr; ?></h3> -->
    </ul>
</body>

</html>