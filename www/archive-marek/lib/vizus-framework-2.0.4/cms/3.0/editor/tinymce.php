<?php

// TinyMCE 4.x installer

error_reporting(-1);

$version = '4.1.6';
$config = array
(
	'new_dir' => dirname(__FILE__).DIRECTORY_SEPARATOR.'tinymce',
	'old_dir' => dirname(__FILE__).DIRECTORY_SEPARATOR.'old',
	'url' => 'http://download.moxiecode.com/tinymce/tinymce_'.$version.'.zip',
	'language_urls' => array
	(
		'cs' => 'http://www.tinymce.com/i18n/download.php?download=cs',
		'en' => 'http://www.tinymce.com/i18n/download.php?download=en_GB',
		'de' => 'http://www.tinymce.com/i18n/download.php?download=de',
		'pl' => 'http://www.tinymce.com/i18n/download.php?download=pl',
		'sk' => 'http://www.tinymce.com/i18n/download.php?download=sk',
		'ru' => 'http://www.tinymce.com/i18n/download.php?download=ru',
		'zh' => 'http://www.tinymce.com/i18n/download.php?download=zh_CN',
	),
//	'url' => 'cache/editor.zip',
//	'language_urls' => array
//	(
//		'cs' => 'cache/cs.zip',
//		'en' => 'cache/en.zip',
//		'de' => 'cache/de.zip',
//		'pl' => 'cache/pl.zip',
//		'sk' => 'cache/sk.zip',
//		'ru' => 'cache/ru.zip',
//		'zh' => 'cache/zh.zip',
//	),
	'delete_dir_cmd' => 'rmdir /S /Q %s',
	'unzip_file_cmd' => 'unzip -qq %s -d %s',
	'copy_dir_cmd' => 'robocopy %s %s /mir /dcopy:T /r:3',
);

$installer = new VizusTinyMCEInstaller($config);
$installer->run();

// ================================================================================================

class VizusTinyMCEInstaller
{
	protected $config;
	
	public function __construct($config)
	{
		$this->config = $config;
	}
	
	// spusteni
	public function run()
	{
		if (is_dir($this->config['new_dir']))
			$this->deleteDir($this->config['new_dir']);
		
		$this->makeDir($this->config['new_dir']);
		
		$this->download();
		$this->copySkins('/^vizus_/');
		$this->copyPlugins('/^vizus_/');
		$this->patchPlugins();
		$this->infoLine('HOTOVO');
	}
	
	// stazeni editoru a jazyku, instalace na misto
	protected function download()
	{
		$this->info('Stahuji editor');
		$file = $this->config['new_dir'].DIRECTORY_SEPARATOR.'editor.zip';
		$this->downloadFile($this->config['url'], $file);
		$this->infoLine('OK');
		
		$this->info('Rozbaluji editor');
		$this->unzipFile($file, $this->config['new_dir']);
		$this->deleteFile($file);
		$this->infoLine('OK');
		
		$this->info('Presouvam adresare editoru');
		$this->moveFiles($this->config['new_dir'].DIRECTORY_SEPARATOR.'tinymce'.DIRECTORY_SEPARATOR.'js'.DIRECTORY_SEPARATOR.'tinymce', $this->config['new_dir']);
		$this->deleteDir($this->config['new_dir'].DIRECTORY_SEPARATOR.'tinymce');
		$this->infoLine('OK');

		foreach ($this->config['language_urls'] as $lang => $url)
		{
			$this->info('Stahuji jazyk '.strtoupper($lang));
			$file = $this->config['new_dir'].DIRECTORY_SEPARATOR.$lang.'.zip';
			$this->downloadFile($url, $file);
			$this->infoLine('OK');
			
			$this->info('Rozbaluji jazyk '.strtoupper($lang));
			$this->unzipFile($file, $this->config['new_dir']);
			$this->deleteFile($file);
			$this->infoLine('OK');
		}
		
		$this->info('Prejmenovavam soubory jazyku');
		$langsDir = $this->config['new_dir'].DIRECTORY_SEPARATOR.'langs';
		$files = scandir($langsDir);
		
		foreach ($files as $file)
		{
			if ($file != '.' and $file != '..')
			{
				$src = $langsDir.DIRECTORY_SEPARATOR.$file;
				$dst = $langsDir.DIRECTORY_SEPARATOR.preg_replace('/_[A-Z]{2}/', '', $file);
				$this->renameFile($src, $dst);
			}
		}

		$this->infoLine('OK');
	}
	
	// zkopirovani skinu
	protected function copySkins($mask)
	{
		$this->info('Kopiruji skiny:');
		
		$skinsSrcDir = $this->config['old_dir'].DIRECTORY_SEPARATOR.'skins';
		$skinsDstDir = $this->config['new_dir'].DIRECTORY_SEPARATOR.'skins';
		$skins = scandir($skinsSrcDir);
		
		foreach ($skins as $skin)
		{
			if ($skin == '.' or $skin == '..')
				continue;
			
			if (!preg_match($mask, $skin))
				continue;
		
			$this->info('Kopiruji skin '.$skin);
			$src = $skinsSrcDir.DIRECTORY_SEPARATOR.$skin;
			$dst = $skinsDstDir.DIRECTORY_SEPARATOR.$skin;
			
			$this->makeDir($dst);
			$this->copyDir($src, $dst);
			$this->infoLine('OK');
		}
	}
		
	// zkopirovai pluginu
	protected function copyPlugins($mask)
	{
		$pluginsSrcDir = $this->config['old_dir'].DIRECTORY_SEPARATOR.'plugins';
		$pluginsDstDir = $this->config['new_dir'].DIRECTORY_SEPARATOR.'plugins';
		$plugins = scandir($pluginsSrcDir);
		
		foreach ($plugins as $plugin)
		{
			if ($plugin == '.' or $plugin == '..')
				continue;
			
			if (!preg_match($mask, $plugin))
				continue;
		
			$this->info('Kopiruji plugin '.$plugin);
			$src = $pluginsSrcDir.DIRECTORY_SEPARATOR.$plugin;
			$dst = $pluginsDstDir.DIRECTORY_SEPARATOR.$plugin;
			
			$this->makeDir($dst);
			$this->copyDir($src, $dst);
			$this->infoLine('OK');
		}
	}
	
	protected function patchPlugins()
	{
		$pluginFile = $this->config['new_dir'].DIRECTORY_SEPARATOR.'plugins'.DIRECTORY_SEPARATOR.'%s'.DIRECTORY_SEPARATOR.'plugin.min.js';
		
		// V HTML5 je misto a.name spravne a.id
		// anchor: zmena atributu a.id na a.name
		// $this->patchFile(sprintf($pluginFile, 'anchor'), '/id:(\w)\.data\.name/', 'name:$1.data.name');
		
		// save: zmena textu tlacitka na title tlacitka
		$this->patchFile(sprintf($pluginFile, 'save'), 'text:"Save"', 'title:"Save"');
		
		// save: pridani ukladani do menu Soubor
		$this->patchFile(sprintf($pluginFile, 'save'), '/(,(\w)\.addShortcut\("ctrl\+s","","mceSave"\))/', '$1,$2.addMenuItem("save",{text:"Save",cmd:"mceSave",icon:"save",shortcut:"Ctrl+S",context:"file"})');

		// link: zakazani zkratky
		$this->patchFile(sprintf($pluginFile, 'link'), '/(,\w\.addShortcut\("Ctrl\+K","",\w\(\w\)\))/', '');

		// link: zakazani menu polozku
		$this->patchFile(sprintf($pluginFile, 'link'), '/(,\w\.addMenuItem\("link",\{.+?\}\))/', '');
		
		// media: zakazani menu polozku
		$this->patchFile(sprintf($pluginFile, 'media'), '/(,\w\.addMenuItem\("media",\{.+?\}\))/', '');

		// od verze 4.1.6 jiz neni potreba
		// advlist: vychozi styl
		// $this->patchFile(sprintf($pluginFile, 'advlist'), '/(,\w&&)\w&&(\(\w\.setStyle\(\w,"listStyleType",\w\))/', '$1$2');

		// od verze 4.0.28 jiz neni potreba, TinyMCE plugint table doplnil potrebna nastaveni
		// table: vychozi css trida tabulky
		// $this->patchFile(sprintf($pluginFile, 'table'), '<table id="__mce"><tbody>', '<table id="__mce" class="cms-editor-table"><tbody>');
		
		$langFile = $this->config['new_dir'].DIRECTORY_SEPARATOR.'langs'.DIRECTORY_SEPARATOR.'%s.js';

		// ul-li
		$cs = array
		(
			'Lower Alpha' => 'Malá písmena',
			'Upper Alpha' => 'Velká písmena',
			'Upper Roman' => 'Velké římské číslice',
			'Lower Roman' => 'Malé římské číslice',
			'Lower Greek' => 'Malá řecká písmena',
			'Decimal' => 'Číslice',
			'Class' => 'Styl',
			'Border color' => 'Barva orámování',
		);
			
		$this->patchLangFile(sprintf($langFile, 'cs'), $cs);
	}
	
	// Low level API
	// ================================================================

	// vytvoreni adresare
	protected function makeDir($dir)
	{
		if (!mkdir($dir, 0777, true))
			$this->error('Nelze vytvorit adresar "'.$dir.'"');
	}
	
	// smazani adresare, vcetne podadresaru
	protected function deleteDir($dir)
	{
		$this->shell(sprintf($this->config['delete_dir_cmd'], escapeshellarg($dir)));
	}
	
	// presun polozek adresare do jineho adresare, vcetne podadresaru
	protected function copyDir($src, $dst)
	{
		if (!is_dir($dst))
			$this->makeDir($dst);
		
		$this->shell(sprintf($this->config['copy_dir_cmd'], escapeshellarg($src), escapeshellarg($dst)), 1);
	}
	
	// presunuti souboru z adresare do adresare, bez podadresaru
	protected function moveFiles($srcDir, $dstDir)
	{
		$files = scandir($srcDir);
		
		foreach ($files as $file)
		{
			if ($file != '.' and $file != '..')
			{
				$src = $srcDir.DIRECTORY_SEPARATOR.$file;
				$dst = $dstDir.DIRECTORY_SEPARATOR.$file;
				
				if (!rename($src, $dst))
					$this->error('Nelze presunout "'.$src.'" do "'.$dst.'"');
			}
		}
	}

	// uprava souboru
	protected function patchFile($file, $search, $replace)
	{
		$this->info('Zaplatuji soubor '.basename(dirname($file)).DIRECTORY_SEPARATOR.basename($file));

		if (strpos($search, '/') !== 0)
			$search = '/'.preg_quote($search, '/').'/';
		
		$contents = preg_replace($search, $replace, $this->loadFile($file), -1, $count);
		
		if ($count == 0)
			$this->error('Zaplatovane misto nenalezeno');
		
		$this->saveFile($file, $contents);
		$this->infoLine($count);
	}

	// uprava JSON souboru
	protected function patchLangFile($file, $map)
	{
		$this->info('Zaplatuji lang soubor '.basename(dirname($file)).DIRECTORY_SEPARATOR.basename($file));
		$contents = $this->loadFile($file);
		
		if (preg_match('/^(tinymce\.addI18n\(\'\w+\',)(\{.+?\})(\);)$/s', $contents, $found))
		{
			$json = json_decode($found[2], true);
		
			foreach ($map as $name => $value)
				$json[$name] = $value;
				
			$json = json_encode($json);
			$contents = $found[1].str_replace('","', "\",\r\n\"", $json).$found[3];

			$this->saveFile($file, $contents);
			$this->infoLine('OK');
		}
		else
			$this->error('Nekompatibilni format');
	}

	// stazeni souboru
	protected function downloadFile($url, $file)
	{
		if (($contents = file_get_contents($url)) === false)
			$this->error('Nelze stahnout soubor "'.$url.'"');
		
		$this->saveFile($file, $contents);
	}
	
	// nacteni obsahu souboru
	protected function loadFile($file)
	{
		if (($contents = file_get_contents($file)) === false)
			$this->error('Nelze nacist soubor "'.$file.'"');
		
		return $contents;
	}
	
	// ulozeni obsahu souboru
	protected function saveFile($file, $contents)
	{
		if (file_put_contents($file, $contents) === false)
			$this->error('Nelze ulozit soubor "'.$file.'"');
	}
	
	// rozbaleni zipu
	protected function unzipFile($file, $dir)
	{
		$this->shell(sprintf($this->config['unzip_file_cmd'], escapeshellarg($file), escapeshellarg($dir)));
	}
	
	// prejmenovani nebo presun souboru
	protected function renameFile($src, $dst)
	{
		if (!rename($src, $dst))
			$this->error('Nelze prejmenovat "'.$src.'" na "'.$dst.'"');
	}

	// smazani souboru
	protected function deleteFile($file)
	{
		if (!unlink($file))
			$this->error('Nelze smazat soubor "'.$file.'"');
	}

	// prikazovy radek
	protected function shell($cmd, $ok = 0)
	{
		exec($cmd.' 2>&1', $out, $ret);
		
		if ($ret != $ok)
			$this->error('Prikaz "'.$cmd.'" vratil chybu '.$ret.': '.join(PHP_EOL, $out));
	}
	
	// vypis zpravy
	protected function info($message)
	{
		echo $message.' ';
	}
	
	// vypis zpravy na novy radek
	protected function infoLine($message)
	{
		echo $message.PHP_EOL;
	}

	// vypis chyby a zastaveni programu
	protected function error($error)
	{
		$this->infoLine('ERROR: '.$error);
		exit(1);
	}
}