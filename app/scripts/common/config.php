<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$domain = filter_input(INPUT_SERVER, "SERVER_NAME");
if($domain ==="localhost"){
    define('CONFIG_HOST', 'localhost');
    define('CONFIG_DBNAME', 'vizus_eshop');
    define('CONFIG_USER', 'root');
    define('CONFIG_PASSWORD', '');
}
$log_file = CONFIG_PHP_ROOT .'log\error_log.txt';
define('CONFIG_LOG_FILE', $log_file);
