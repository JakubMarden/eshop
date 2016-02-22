<?php
// SYSTAT Setup
// Updated: 8.7.2013 21:21:31

// konfigurace
if (file_exists($config = (dirname(__FILE__).'/systat.conf')))
	$CFG = parse_ini_file($config);
elseif (file_exists($config = '/usr/local/etc/systat.conf'))
	$CFG = parse_ini_file($config);
else
	die("Configuration systat.conf not found\n");

$CFG['name'] = strtoupper($CFG['name']);
$CFG['servers'] = empty($CFG['servers']) ? array() : preg_split('/\s*,\s*/', strtolower($CFG['servers']));
$CFG['work_dir'] = realpath($CFG['work_dir']);
$CFG['color_text'] = strpos($CFG['color'], '80') !== false ? '#FFF' : '#000';

$action = isset($_REQUEST['action']) ? (int)$_REQUEST['action'] : 0;

if (isset($_REQUEST['format']) and preg_match('/^(html|wml)$/', $_REQUEST['format']))
	$format = $_REQUEST['format'];
elseif (isset($_SERVER['HTTP_USER_AGENT']) and preg_match('/mozilla|opera/i', $_SERVER['HTTP_USER_AGENT']))
	$format = 'html';
else
	$format = 'wml';

$ignoredAlertsFile = $CFG['work_dir'].'/systat.ignored-alerts';

switch ($action)
{
	// zpracovani
	case 1:
	{
		if (isset($_REQUEST['ignoredAlerts']))
		{
			$ignoredAlerts = $_REQUEST['ignoredAlerts'];
			if (is_array($ignoredAlerts))
				$ignoredAlerts = join(', ', $ignoredAlerts);

			if ($f = @fopen($ignoredAlertsFile, 'w'))
			{
				fwrite($f, $ignoredAlerts);
				fclose($f);
			}
		}
		elseif (file_exists($ignoredAlertsFile))
			@unlink($ignoredAlertsFile);

		header('Location: http://'.$_SERVER['SERVER_NAME'].$_SERVER['SCRIPT_NAME']);
		exit;
	}
	// zobrazeni
	default:
	{
		$ignoredAlerts = array();
		if ($content = @file_get_contents($ignoredAlertsFile))
		{
			$lst = explode(',', $content);
			foreach ($lst as $set)
			{
				if ($set = trim($set))
					$ignoredAlerts[$set] = 1;
			}
		}

		$ignoredAlertList = array
		(
			'all'				=> array('name' => 'All', 'description' => 'všechny následující'),
			'load'			=> array('name' => 'Load', 'description' => 'překročení load 1, 5, 15'),
			'router'			=> array('name' => 'Router', 'description' => 'konektivita lokálního routeru přes ping'),
			'internet'		=> array('name' => 'Internet', 'description' => 'konektivita internetu přes ping na náhodný web'),
			'raid'			=> array('name' => 'RAID', 'description' => 'stav atacontrol pole'),
			'gmirror'		=> array('name' => 'GMirror', 'description' => 'stav gmirror pole'),
			'zpool'			=> array('name' => 'ZPOOL', 'description' => 'stav zfs poolů'),
			'diskspace'		=> array('name' => 'Disk space', 'description' => 'volný diskový prostor'),
			'diskquotas'	=> array('name' => 'Disk quotas', 'description' => 'aktivní diskové kvóty'),
			'php'				=> array('name' => 'PHP', 'description' => 'kontrola kompilace a nastavení PHP'),
			'apache'			=> array('name' => 'Apache', 'description' => 'test HTML, PHP, kontrola počtu běžících procesů'),
			'mysql'			=> array('name' => 'MySQL', 'description' => 'připojitelnost, přetečení počtu spojení'),
			'pgsql'			=> array('name' => 'PostgreSQL', 'description' => 'připojitelnost'),
			'cms'				=> array('name' => 'CMS', 'description' => 'kontrola správné patičky v HTML výstupu webu/adminu'),
			'sender'			=> array('name' => 'Sender', 'description' => 'kontrola odesílání zpráv'),
			'sendmail'		=> array('name' => 'Sendmail', 'description' => 'kontrola běžícího procesu a PID souboru'),
			'amavis'			=> array('name' => 'Amavis', 'description' => 'kontrola běžícího procesu'),
			'kav'				=> array('name' => 'KAV', 'description' => 'kontrola běžícího procesu'),
			'clamav'			=> array('name' => 'ClamAV', 'description' => 'kontrola běžících procesů ClamAV'),
			'spamassassin'	=> array('name' => 'SpamAssassin', 'description' => 'kontrola běžících procesů SpamAssassin'),
			'mailman'		=> array('name' => 'Mailman', 'description' => 'kontrola běžícího procesu'),
			'sysdemons'		=> array('name' => 'Sysdemons', 'description' => 'kontrola démonů Syslog a Cron'),
			'pureftp'		=> array('name' => 'PureFTP', 'description' => 'kontrola běžícího procesu'),
			'backuppc'		=> array('name' => 'BackupPC', 'description' => 'kontrola běžícího procesu'),
			'gsmmodem'		=> array('name' => 'GSM modem', 'description' => 'dostupnost modemu'),
			'errorlogs'		=> array('name' => 'Error logs', 'description' => 'přítomnost error logů Sysutils, Fulltext, Sender'),
			'servers'		=> array('name' => 'Servers ', 'description' => 'konektivita serverů přes ping/socket/web/ssh'),
		);

		switch ($format)
		{
			case 'wml':
			{
				header('Content-Type: text/vnd.wap.wml');
				echo '<?xml version="1.0" encoding="utf-8" ?>'."\n";
				echo '<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.1//EN" "http://www.wapforum.org/DTD/wml_1.1.xml">'."\n";
				echo '<wml>';
					echo '<head>';
						echo '<meta forua="true" http-equiv="Cache-Control" content="must-revalidate"/>';
						echo '<meta forua="true" http-equiv="Cache-Control" content="max-age=0"/>';
						echo '<meta forua="true" http-equiv="Cache-Control" content="no-cache"/>';
					echo '</head>';
					echo '<card title="'.$CFG['name'].' Systat Setup" id="c1">';
						echo '<do type="accept" label="Save Systat Setup">';
							echo '<go method="post" href="http://'.$_SERVER['SERVER_NAME'].$_SERVER['SCRIPT_NAME'].'?action=1">';
									echo '<postfield name="ignoredAlerts" value="" />';
							echo '</go>';
						echo '</do>';
						echo '<p><a href="http://'.$_SERVER['SERVER_NAME'].'/systat/">Systat</a></p>';
						echo '<p><b>Ignored alerts:</b></p>';
						echo '<p>';
							echo '<select multiple="true" name="ignoredAlerts" value="'.join(';', array_keys($ignoredAlerts)).'">';

									foreach ($ignoredAlertList as $name => $item)
										echo '<option value="'.$name.'">'.$item['name'].'</option>';

							echo '</select>';
						echo '</p>';
					echo '</card>';
				echo '</wml>';
				break;
			}
			case 'html':
			{
				echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'."\n";
				echo '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="cs" lang="cs">'."\n";
					echo '<head>';
						echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
						echo '<meta http-equiv="pragma" content="no-cache" />';
						echo '<meta http-equiv="expires" content="-1" />';
						echo '<title>'.$CFG['name'].' Systat Setup</title>';
						echo '<link type="text/css" rel="stylesheet" href="/server/res/main.css" />';
						echo '<style type="text/css">';
							echo 'td.check {padding: 2px;}';
							echo 'td.check.on {background-color: #00D000;}';
							echo 'td.check.off {background-color: #D00000;}';
						echo '</style>';
					echo '</head>';
					echo '<body>';
						echo '<h1>Systat - '.$CFG['host'].'</h1>';
						echo '<div class="navigation">';
							echo '<div class="select">';

								$thisServer = strtolower($CFG['name']);
								$i = array_search($thisServer, $CFG['servers']);
								$prevServer = $i == 0 ? null : $CFG['servers'][$i - 1];
								$nextServer = $i == count($CFG['servers']) - 1 ? null : $CFG['servers'][$i + 1];

								echo '<select onchange="document.location=\'http://\'+this.value+\'.default.cz/systat/\'">';

									foreach ($CFG['servers'] as $server)
										echo '<option value="'.$server.'"'.($server == $thisServer ? ' selected' : '').'>'.ucfirst($server).'</a></option>';

								echo '</select>';
							echo '</div>';
							echo '<ul>';
								echo '<li><a href="http://'.$CFG['host'].'/systat/">Systat result</a></li>';
								echo '<li><a href="http://'.$CFG['host'].'/apache.php">Apache status</a></li>';

								if ($nextServer)
								{
									echo '<li><a href="http://'.$CFG['host'].'/info.php">PHP info</a></li>';
									echo '<li class="last"><a href="http://'.$nextServer.'.default.cz/systat/">Next</a></li>';
								}
								else
									echo '<li class="last"><a href="http://'.$CFG['host'].'/info.php">PHP info</a></li>';

							echo '</ul>';
						echo '</div>';
						echo '<div class="content">';
							echo '<form method="post" action="http://'.$_SERVER['SERVER_NAME'].$_SERVER['SCRIPT_NAME'].'?action=1">';
								echo '<table cellspacing="0">';
									echo '<tr><th colspan="2">Ignored alerts</th></tr>';

									foreach ($ignoredAlertList as $id => $item)
									{
										echo '<tr>';
											echo '<td class="check '.(isset($ignoredAlerts[$id]) ? 'off' : 'on').'" id="Cell'.$id.'">';
												echo '<input type="checkbox" class="checkbox" name="ignoredAlerts[]" id="'.$id.'" value="'.$id.'"'.(isset($ignoredAlerts[$id]) ? ' checked="checked"' : '').' onclick="Switch(this)" />';
											echo '</td>';
											echo '<td><label for="'.$id.'"><strong>'.$item['name'].'</strong> - '.$item['description'].'</lable></td>';
										echo '</tr>';
									}

									echo '<tr>';
										echo '<td colspan="2" class="footer"><input type="submit" class="button" value="Save" /></td>';
									echo '</tr>';
								echo '</table>';
							echo '</form>';
							echo '<script type="text/javascript">';
								echo 'function Switch(obj)';
								echo '{';
									echo 'document.getElementById("Cell"+obj.id).className = obj.checked ? "check off" : "check on";';
								echo '}';
							echo '</script>';
						echo '</div>';
						echo '<div class="footer">';
							echo '<ul>';
								echo '<li><a href="http://www.freebsd.org/"><img src="/server/res/freebsd.gif" width="66" height="25" alt="Powered by FreeBSD" /></a></li>';
								echo '<li>Server <strong>'.php_uname('n').'</strong></li>';
								echo '<li>'.date('r').'</li>';
								echo '<li><a href="http://'.$CFG['host'].'/">'.$CFG['host'].'</a></li>';
								echo '<li class="last"><a href="http://www.vizus.cz/webmaster">webmaster</a></li>';
							echo '</ul>';
						echo '</div>';
					echo '</body>';
				echo '</html>';
				break;
			}
		}
		break;
	}
}
