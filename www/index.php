<?php
mb_internal_encoding("UTF-8");

define("CONFIG_ROOT", dirname(__FILE__));
define("CONFIG_PHP_ROOT",__DIR__."\..\app\\");

require_once(CONFIG_PHP_ROOT.'/scripts/common/config.php');
require_once(CONFIG_PHP_ROOT.'/scripts/common/Autoload.php');

$router = new Router;
$router->route($_SERVER['REQUEST_URI']);