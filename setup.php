<?php
$user = 'root';
$password = 'root';
$db = 'SATVIK';
$socket = 'localhost:8889';

$myConnection= mysqli_connect($socket,$user,$password) or die ("could not connect to mysql");
mysqli_select_db($myConnection, $db) or die ("no database");
?>
