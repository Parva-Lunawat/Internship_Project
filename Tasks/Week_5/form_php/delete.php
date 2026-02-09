<?php
ob_start();
if (isset($_GET['name'])) {
    $nameToDelete = $_GET['name'];

    $contactsFile = 'contacts.json';
    $contacts = file_exists($contactsFile) ?
        json_decode(file_get_contents($contactsFile), true) :
        [];
    $filtered_contacts = array_filter($contacts, fn($c) => $c['name'] !== $nameToDelete);

    file_put_contents($contactsFile, json_encode($filtered_contacts));
    echo "Contact Deleted";
    header('Location: index.php');
    exit;
}
?>