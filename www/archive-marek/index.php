<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="cs" lang="cs">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title><?= $_SERVER['SERVER_NAME'] ?></title>
		<link type="text/css" rel="stylesheet" href="/server/res/main.css" />
	</head>
	<body>
		<h1><?= $_SERVER['SERVER_NAME'] ?></h1>
		<div class="content">
			<h2>default.cz</h2>
			<p><strong>default.cz</strong> je označení pro servery provozované společností <strong><a href="http://www.vizus.cz/">VIZUS.CZ</a></strong>,
			 které slouží pro poskytování internetových služeb klientům společnosti a jejích partnerů. Kontaktní informace, popis služeb a produktů,
			 najdete na <a href="http://www.vizus.cz/">www.vizus.cz</a></p>
			<p>Máte-li zájem o tvorbu webové prezentace či aplikace, podívejte se na <a href="http://www.vizus.cz/">www.vizus.cz</a></p>
			<h3>Služby</h3>
			<p>Několik důležitých odkazů.</p>
			<ul>
				<li><a href="http://webstats.vizus.cz/">Statistiky návštěvnosti webů</a></li>
				<li><a href="https://webmail.vizus.cz/">Přístup k poště přes webmail</a></li>
				<li><a href="https://mailsetup.vizus.cz/">Nastavení poštovní schránky</a></li>
				<li><a href="http://www.vizus.cz/ruzne-navody/ca-vizus.html">Certifikační autorita VIZUS</a></li>
			</ul>
		</div>
		<div class="footer">
			<ul>
				<li><a href="http://www.freebsd.org/"><img src="/server/res/freebsd.gif" width="66" height="25" alt="Powered by FreeBSD" /></a></li>
				<li>Server <strong><?= php_uname('n') ?></strong></li>
				<li><?= date('r') ?></li>
				<li>Your IP is <a href="http://www.db.ripe.net/whois?searchtext=<?= $_SERVER['REMOTE_ADDR'] ?>"><?= $_SERVER['REMOTE_ADDR'] ?></a></li>
				<li><a href="http://<?= $_SERVER['SERVER_NAME'] ?>/"><?= $_SERVER['SERVER_NAME'] ?></a></li>
				<li class="last"><a href="http://www.vizus.cz/webmaster">webmaster</a></li>
			</ul>
		</div>
	</body>
</html>