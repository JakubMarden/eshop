<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="cs" lang="cs">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title>DBTools &ndash; <?= $_SERVER['SERVER_NAME'] ?></title>
		<link type="text/css" rel="stylesheet" href="/server/res/main.css" />
		<style type="text/css">
			p.enter {text-align: center;}
			p.enter a {display: block; width: 188px; height: 52px; margin: auto;}
			p.enter a span {display: none;}
			p.adminer3 a {background: url(res/adminer3.png);}
			p.phpmyadmin3 a {background: url(res/phpmyadmin3.png);}
			p.phpmyadmin2 a {background: url(res/phpmyadmin2.png);}
		</style>
	</head>
	<body>
		<h1>DBTools &ndash; <?= $_SERVER['SERVER_NAME'] ?></h1>
		<div class="content">
			<h2>Databázové nástroje</h2>

			<h3>Adminer 3</h3>
			<p>Jednoduchý, přehledný, snadno použitelný nástroj pro správu databází MySQL. Více na <a href="http://www.adminer.org/">www.adminer.org</a></p>
			<p class="enter adminer3"><a href="adminer3/" title="Adminer 3"><span>Adminer 3</span></a></p>

			<h3>PhpMyAdmin 3</h3>
			<p>Tradiční nástroj pro správu databází MySQL, méně přehledný a složitější než Adminer. Více na <a href="http://www.phpmyadmin.net/">www.phpmyadmin.net</a></p>
			<p class="enter phpmyadmin3"><a href="phpmyadmin3/" title="PhpMyAdmin 3"><span>PhpMyAdmin 3</span></a></p>

			<h3>PhpMyAdmin 2</h3>
			<p>Starší a přehlednější verze PMA. Obsahuje pár nedodělků a chybí podpora novějších verzí MySQL. Více na <a href="http://www.phpmyadmin.net/">www.phpmyadmin.net</a></p>
			<p class="enter phpmyadmin2"><a href="phpmyadmin2/" title="PhpMyAdmin 2"><span>PhpMyAdmin 2</span></a></p>

			<h3>Neplatnost SSL certifikátu</h3>
			<p>Pokud nechcete být příště obtěžovány hlášením prohlížeče o neplatnosti SSL certifikátu, přidejte si certifikační autoritu VIZUS mezi
			důvěryhodné autority. Návod k naleznete na stránce <a href="http://www.vizus.cz/ruzne-navody/ca-vizus.html">Certifikační autorita
			VIZUS</a>.</p>
		</div>
		<div class="footer">
			<ul>
				<li><a href="http://www.freebsd.org/"><img src="/server/res/freebsd.gif" width="66" height="25" alt="Powered by FreeBSD" /></a></li>
				<li><a href="https://<?= $_SERVER['SERVER_NAME'] ?>/"><?= $_SERVER['SERVER_NAME'] ?></a></li>
				<li class="last"><a href="http://www.vizus.cz/webmaster">webmaster</a></li>
			</ul>
		</div>
	</body>
</html>