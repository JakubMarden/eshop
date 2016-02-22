<?
// Apache Server Status
// Updated: 30.4.2011 15:28:24

if (!$content = @file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/server-status'))
	die('Can not open server-status');

if (strpos($content, '<title>Apache Status</title>') === false)
	die('Invalid content');

$server = array
(
	'name'								=> 'unknown',
	'software'							=> '?',
	'restart_time'						=> 0,
	'up_time'							=> '?',
	'requests_per_second'			=> 0,
	'transfer_per_second'			=> 0,
	'transfer_per_second_unit'		=> '',
	'transfer_per_request'			=> 0,
	'transfer_per_request_unit'	=> '',
	'active_requests'             => 0,
	'idle_slots'						=> 0,
	'process_status'					=> array(),
);

if (preg_match('/<h1>Apache Server Status for\s+(.+?)<\/h1>/', $content, $found))
	$server['name'] = trim($found[1]);

if (preg_match('/Server Version:\s+(.+?)<\/dt>/', $content, $found))
	$server['software'] = trim($found[1]);

if (preg_match('/Restart Time:\s+\w+,\s+(\d+-\w+-\d+\s+\d+:\d+:\d+)/', $content, $found))
	$server['restart_time'] = strtotime($found[1]);

if (preg_match('/Server uptime:\s+(.+?)<\/dt>/', $content, $found))
	$server['up_time'] = trim($found[1]);

if (preg_match('/([\d\.]+)\s+requests\/sec/', $content, $found))
	$server['requests_per_second'] = strpos($found[1], '.') === 0 ? '0'.$found[1] : $found[1];

if (preg_match('/([\d\.]+)\s+([km]?B)\/second/', $content, $found))
{
	$server['transfer_per_second'] = strpos($found[1], '.') === 0 ? '0'.$found[1] : $found[1];
	$server['transfer_per_second_unit'] = $found[2];
}

if (preg_match('/(\d+) requests currently being processed, (\d+) idle workers/', $content, $found))
{
	$server['active_requests'] = $found[1];
	$server['idle_slots'] = $found[2];
}

/*
if (preg_match('/([\d\.]++)\s+([km]?B)\/request/', $content, $found))
{
	$server['transfer_per_request'] = strpos($found[1], '.') === 0 ? '0'.$found[1] : $found[1];
	$server['transfer_per_request_unit'] = $found[2];
}

if (preg_match('/<pre>([\._SRWKDCLI\s]+)<\/pre>/s', $content, $found))
	$server['process_status'] = str_split(preg_replace('/\s+/', '', $found[1]));
*/

$virtuals = $topClients = $topHosts = array();
if (preg_match_all('/<tr>(.+?)<\/tr>/s', $content, $rows))
{
	foreach ($rows[1] as $row)
	{
		if (preg_match_all('/<td.*?>(.+?)<\/td>/s', $row, $cells))
		{
			if (count($cells[1]) != 13)
				continue;

			$cell = $cells[1];

			list($child, $generation) = explode('-', strip_tags(trim($cell[0])));
			list($accConnection, $accChild, $accSlot) = explode('/', trim($cell[2]));

			$client = trim($cell[10]);
			$state = trim(strip_tags($cell[3]));

			$virtuals[] = array
			(
				'child' => $child,
				//'generation' => $generation,
				'pid' => trim($cell[1]),
				'acc_connection' => $accConnection,
				'acc_child' => $accChild,
				//'acc_slot' => $accSlot,
				'state' => $state,
				'cpu' => trim($cell[4]),
				//'start' =>trim($cell[5]),
				//'time' => trim($cell[6]),
				'connection_kb' => trim($cell[7]),
				//'child_mb' => trim($cell[8]),
				//'slot_mb' => trim($cell[9]),
				'client' => $client,
				'host' => trim($cell[11]),
				'request' => preg_replace('/ HTTP\/\d+\.\d+/', '', trim($cell[12])),
			);

			if ($state != '.')
			{
				@$topClients[$client]++;
				@$topHosts[ trim($cell[11]) ]++;
			}
		}
	}
}

$virtualStateList = array
(
	'_' => array('name' => 'idle', 'color' => '#C0C0C0'),
	'S' => array('name' => 'start', 'color' => '#FF6000'),
	'R' => array('name' => 'read', 'color' => '#FF6000'),
	'W' => array('name' => 'write', 'color' => '#E60000'),
	'K' => array('name' => 'keep', 'color' => '#0000FF'),
	'D' => array('name' => 'dns', 'color' => '#8000FF'),
	'C' => array('name' => 'close', 'color' => '#008000'),
	'L' => array('name' => 'log', 'color' => '#C0C0C0'),
	'G' => array('name' => 'finish', 'color' => '#008000'),
	'I' => array('name' => 'clean', 'color' => '#C0C0C0'),
	'.' => array('name' => '&nbsp;', 'color' => '#C0C0C0'),
);

echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'."\n";
echo '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="cs" lang="cs">'."\n";
	echo '<head>';
		echo '<meta http-equiv="content-type" content="text/html; charset=utf-8" />';

		if (!empty($_GET['refresh']) and is_numeric($_GET['refresh']))
			echo '<meta http-equiv="refresh" content="'.$_GET['refresh'].'" />';

		echo '<title>Apache Server Status - '.$server['name'].'</title>';
		echo '<link type="text/css" rel="stylesheet" href="/server/res/main.css" />';
		echo '<style type="text/css">';
			echo 'div.deck {float: left; margin-right: 20px;}';
			echo 'h2.cleaner {clear: both; padding-top: 20px; _padding-top: 0px;}';

			foreach ($virtualStateList as $state)
				echo 'table td.state.'.$state['name'].' {color: '.$state['color'].';}';

		echo '</style>';
	echo '</head>';
	echo '<body>';
		echo '<h1>Apache Server Status - '.$server['name'].'</h1>';
		echo '<div class="navigation">';
			echo '<ul>';
				echo '<li><a href="/info.php">PHP info</a></li>';
				echo '<li><a href="/systat/">Systat</a></li>';
				echo '<li><a href="/apache.php?refresh=1">Refresh 1</a></li>';
				echo '<li><a href="/apache.php?refresh=2">Refresh 2</a></li>';
				echo '<li><a href="/apache.php?refresh=5">Refresh 5</a></li>';
				echo '<li class="last"><a href="/apache.php">Refresh Off</a></li>';
			echo '</ul>';
		echo '</div>';
		echo '<div class="content" style="width: auto">';
			echo '<div>';
				echo '<div class="deck">';
					echo '<h2>Server</h2>';
					echo '<table cellspacing="0">';
						echo '<tr>';
							echo '<td class="label">Software:</td>';
							echo '<td>'.$server['software'].'&nbsp;</td>';
						echo '</tr>';
						echo '<tr>';
							echo '<td class="label">Uptime:</td>';
							echo '<td>'.$server['up_time'].($server['restart_time'] ? ' from '.date('j.n.Y, H:i:s', $server['restart_time']) : '').'&nbsp;</td>';
						echo '</tr>';
						echo '<tr>';
							echo '<td class="label">Per second:</td>';
							echo '<td>';
								echo '<strong>'.number_format($server['requests_per_second'], 3, '.', ' ').'</strong> requests, ';
								echo '<strong>'.number_format($server['transfer_per_second'], $server['transfer_per_second_unit'] == 'B' ? 0 : 1, '.', ' ').' '.$server['transfer_per_second_unit'].'</strong> transfers';
								echo '&nbsp;';
							echo '</td>';
						echo '</tr>';
						echo '<tr>';
							echo '<td class="label">Status:</td>';
							echo '<td><strong>'.$server['active_requests'].'</strong> active requests, <strong>'.$server['idle_slots'].'</strong> idle slots</td>';
						echo '</tr>';
					echo '</table>';
				echo '</div>';

				echo '<div class="deck">';
					echo '<h2>Top virtuals</h2>';
					echo '<table cellspacing="0">';
						echo '<tr>';
							//echo '<th width="25">#</th>';
							echo '<th>Virtual</th>';
							echo '<th>Count</th>';
						echo '</tr>';

						$i = 1;
						arsort($topHosts);
						foreach ($topHosts as $host => $c)
						{
							echo '<tr>';
								//echo '<td class="num">'.$i.'</td>';
								echo '<td>'.$host.'</td>';
								echo '<td class="num">'.$c.'</td>';
							echo '</tr>';

							if ($i++ == 3)
								break;
						}

					echo '</table>';
				echo '</div>';

				echo '<div class="deck">';
					echo '<h2>Top clients</h2>';
					echo '<table cellspacing="0">';
						echo '<tr>';
							//echo '<th width="25">#</th>';
							echo '<th>IP</th>';
							echo '<th>Host</th>';
							echo '<th>Count</th>';
						echo '</tr>';

						$i = 1;
						arsort($topClients);
						foreach ($topClients as $ip => $c)
						{
							echo '<tr>';
								//echo '<td class="num">'.$i.'</td>';
								echo '<td>'.$ip.'</td>';
								echo '<td>'.@gethostbyaddr($ip).'</td>';
								echo '<td class="num">'.$c.'</td>';
							echo '</tr>';

							if ($i++ == 3)
								break;
						}

					echo '</table>';
				echo '</div>';
			echo '</div>';

			echo '<h2 class="cleaner">Active slots</h2>';
			echo '<table cellspacing="0">';
				echo '<tr>';
					echo '<th width="25" rowspan="2">Slot</th>';
					echo '<th colspan="4">Process</th>';
					echo '<th colspan="3">Client</th>';
					echo '<th rowspan="2">Virtual</th>';
					echo '<th rowspan="2">Request</th>';
				echo '</tr>';
				echo '<tr>';
					echo '<th width="40">PID</th>';
					echo '<th width="35">CPU</th>';
					echo '<th width="35">Req</th>';
					echo '<th width="40">State</th>';
					echo '<th width="100">IP</th>';
					echo '<th width="30">Req</th>';
					echo '<th width="40">KB</th>';
				echo '</tr>';

				foreach ($virtuals as $virtual)
				{
					if ($virtual['state'] == '.')
						continue;

					$state = $virtualStateList[ $virtual['state'] ];

					echo '<tr>';
						echo '<td class="num">'.$virtual['child'].'</td>';
						echo '<td class="num">'.$virtual['pid'].'</td>';
						echo '<td class="num">'.$virtual['cpu'].'</td>';
						echo '<td class="num">'.$virtual['acc_child'].'</td>';
						echo '<td class="state '.$state['name'].'">'.$state['name'].'</td>';
						echo '<td>'.$virtual['client'].'</td>';
						echo '<td class="num">'.$virtual['acc_connection'].'</td>';
						echo '<td class="num">'.$virtual['connection_kb'].'</td>';
						echo '<td>'.$virtual['host'].'</td>';
						echo '<td>'.$virtual['request'].'</td>';
					echo '</tr>';
				}

			echo '</table>';

		echo '</div>';
		echo '<div class="footer">';
			echo '<ul>';
				echo '<li><a href="http://www.freebsd.org/"><img src="/server/res/freebsd.gif" width="66" height="25" alt="Powered by FreeBSD" /></a></li>';
				echo '<li>Server <strong>'.php_uname('n').'</strong></li>';
				echo '<li>'.date('r').'</li>';
				echo '<li><a href="http://'.$_SERVER['SERVER_NAME'].'/">'.$_SERVER['SERVER_NAME'].'</a></li>';
				echo '<li class="last"><a href="http://www.vizus.cz/webmaster">webmaster</a></li>';
			echo '</ul>';
		echo '</div>';
	echo '</body>';
echo '</html>';