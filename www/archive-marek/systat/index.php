<?php
// SYSTAT view
// Updated: 1.5.2008 15:56

if (isset($_GET['format']) and preg_match('/^(html|wml)$/', $_GET['format']))
	$result = 'result.'.$_GET['format'];
elseif (isset($_SERVER['HTTP_USER_AGENT']) and preg_match('/mozilla|opera/i', $_SERVER['HTTP_USER_AGENT']))
	$result = 'result.html';
else
	$result = 'result.wml';

if ($result == 'result.wml')
	header('Content-Type: text/vnd.wap.wml');

if (file_exists($result))
	readfile($result);
else
	echo 'Result file not found';
