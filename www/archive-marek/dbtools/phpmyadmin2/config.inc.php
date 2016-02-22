<?php

$host = php_uname('n');
$server = preg_replace('/\..+/', '', $host);

$cfg['blowfish_secret'] = 'a52s37wp24x965G34JK9hx5';

$i = 1;
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['auth_type'] = 'http';
$cfg['Servers'][$i]['user'] = '';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['verbose'] = strtoupper($server);

$cfg['PmaAbsoluteUri'] = 'https://'.php_uname('n').'/dbtools/phpmyadmin2/';
$cfg['Lang']               = 'cs-utf-8'; // cs-win1250, cs-utf-8, cs-iso-8859-2
$cfg['LeftFrameLight']     = true;
$cfg['LeftFrameDBTree']    = false;
$cfg['LeftDisplayLogo']    = false;
$cfg['ThemeManager']       = 0;
$cfg['TitleTable']         = '@VSERVER@ / @DATABASE@ / @TABLE@';
$cfg['TitleDatabase']      = '@VSERVER@ / @DATABASE@';
$cfg['TitleServer']        = '@VSERVER@';
$cfg['TitleDefault']       = '@PHPMYADMIN@';
$cfg['TextareaCols']       = 40;
$cfg['TextareaRows']       = 7;
$cfg['TextareaAutoSelect'] = false;

// barva serveru
$conf = '/usr/local/etc/servers.conf';

if (is_file($conf))
{
	$servers = parse_ini_file($conf, true);

	if (isset($servers[$server]))
	{
		$cfg['ServerColorLight'] = $servers[$server]['color_light'];
		$cfg['ServerColorDark'] = $servers[$server]['color_dark'];
	}
}

if (empty($cfg['ServerColorLight']))
	$cfg['ServerColorLight'] = '#CCCCCC';

if (empty($cfg['ServerColorDark']))
	$cfg['ServerColorDark'] = '#999999';

