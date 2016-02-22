<?php
// SYSTAT PHP Test
header('Content-type: text/plain');

echo 'php-version: '.PHP_VERSION."\n";
echo 'mysql-version: '.(function_exists('mysql_get_client_info') ? @mysql_get_client_info() : '')."\n";
