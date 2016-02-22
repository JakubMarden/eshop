<?php

$VIZUS_ADMINER_VERSION = '3.3.4';
$VIZUS_ADMINER_URL = 'https://%s/dbtools/adminer3/';
$VIZUS_TRUSTED_IP_REGEXP = '/^(127\..+|10\..+|192\.168\..+|82\.208\.6\..+)$/';
$VIZUS_TRUSTED_IPS = array('46.13.41.46', '81.0.216.195');
$VIZUS_HOSTS = array();

$conf = '/usr/local/etc/servers.conf';

if (is_file($conf))
{
	$servers = parse_ini_file($conf, true);

	foreach ($servers as $server)
	{
		if (preg_match('/\bmysql\b/', $server['services']))
			$VIZUS_HOSTS[ $server['host'] ] = $server['color_light'];
	}
}

// Vizus customizations
function adminer_object()
{
	class VizusAdminer extends Adminer
	{
		// name by server hostname
		public function name()
		{
			return 'Adminer - '.php_uname('n');
		}

		// login form with MySQL and localhost
		public function loginForm()
		{
			$drivers = array('server' => 'MySQL');
?>
			<table cellspacing="0">
				<tr><th>Systém<td><?php echo html_select("driver", $drivers, DRIVER); ?>
				<tr><th>Uživatel<td><input type="text" name="username" id="username" value="<?php echo h($_GET["username"]); ?>">
				<tr><th>Heslo<td><input type="password" name="password" id="password">
			</table>
			<input name="server" type="hidden" value="localhost">
			<script type="text/javascript">
				document.getElementById('username').focus();
			</script>
			<p><input type="submit" value="Přihlásit">
<?php
			echo checkbox("permanent", 1, $_COOKIE["adminer_permanent"], 'Trvalé přihlášení') . "\n";
		}

		// disable version checker, author Jakub Vrana
		public function navigation($missing)
		{
			parent::navigation($missing);

			echo '<script type="text/javascript">verifyVersion = function () {};</script>';
		}
	}

	return new VizusAdminer;
}

// Vizus images overloading
if (!empty($_GET['file']))
{
	switch ($_GET['file'])
	{
		case 'plus.gif':
		case 'cross.gif':
		case 'up.gif':
		case 'down.gif':
		{
			$path = './res/'.str_replace('.gif', '.png', $_GET['file']);
			$mtime = filemtime($path);
			$size = filesize($path);
			$etag = md5($path.$mtime.$size);

			header('Expires: '.gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
			header('Cache-Control: max-age=3600');
			header('ETag: "'.$etag.'"');

			if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) and strtotime(preg_replace('/;.*/', '', $_SERVER['HTTP_IF_MODIFIED_SINCE'])) == $mtime)
			{
				header('HTTP/1.1 304 Not Modified', true);
				exit;
			}

			header('Last-Modified: '.gmdate('D, d M Y H:i:s', $mtime).' GMT');
			header('Content-Type: image/png');
			echo file_get_contents($path);
			exit;
		}
	}
}

// original Adminer
include './adminer.inc';
