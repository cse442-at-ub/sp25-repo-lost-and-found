<?php
require_once 'session.php';
session_unset();
endSession();
echo "Logout";
?>