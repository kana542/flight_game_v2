<?php

$serverName = "localhost";
$dBUsername = "root";
$dBPassword = "";
$dBName = "joku nimi";

$conn = mysqli_connect($serverName, $dBUsername, $dBPassword, $dBName);

if (!$conn) {
    die("Vittu ei yhteyttä: " . mysqli_connect_error());
} 