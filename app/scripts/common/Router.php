<?php


class Router
{
    /** @var string Obsahuje o volanem modulu. */
    private $module;

    /** @var string Obsahuje informace o volanem kontroleru. */
    private $controller;
    
    /** @var string Obsahuje informace o volane metode. */
    private $method;

    /** @var string Obsahuje informace, vkladane do metody jako parametry. */
    private $parameters;
    
    /** @var string Nastavuje nazev frontendove slozky aplikace. */
    private $directoryFrontendName = 'FrontendModule';
    
    /** @var string astavuje nazev backendove slozky aplikace. */
    private $directoryAdminName = 'AdminModule';
    
    /**
    * iniciace routovani
    */
    public function route($url)
    {
        $choppedUrl = $this->parseUrl($url); 
        $this->setComponents($choppedUrl);
        $this->initRoute();
    }
    
    /**
    * 1.cast routy - rozseka url na komponenty a ocisti je
    * @param    string   $url puvodni volana cesta
    * @return   $choppedUrl array se zpracovanou cestou
    */
    private function parseUrl($url)
    {
        $parsedUrl = parse_url($url);
        $parsedUrl["path"] = ltrim($parsedUrl["path"], "/");
        $parsedUrl["path"] = trim($parsedUrl["path"]);   
        
        return $choppedUrl = explode("/", $parsedUrl["path"]);       
    }
    
    /**
    * konecna faze routy - zavolani prislusne tridy a jeji metody popr. presmerovani na error 404
    */
    private function initRoute()
    {
        $controller_class_name = ($this->module .$this->controller);
        $controller_path = CONFIG_PHP_ROOT .$this->module .'controller/' . $this->controller . '.php';
        $method = $this->method;
        
        if (file_exists($controller_path))
        {
            $instance = new $controller_class_name();
            
            if((method_exists($instance, $method)) and (isset($this->parameters)))
            {
                $instance->$method($this->parameters);
            }
            elseif((method_exists($instance, $method)) and (!isset($this->parameters))) 
            {     
                $instance->$method();                
            }
            else
            {
                $log = "Nenalezena metoda :$method - v controlleru - " .$controller_class_name;
                new Log($log);
                $this->showError(); 
            }    
        }
        else
        {
            $log = "Nenalezen Controller - " .$controller_class_name ." v modulu - " .$this->module;
            new Log($log);
            $this->showError(); 
        }
    }        
    
    /**
    * 2.faze routy - zjisteni jake casti url jsou moduly, kontrolery, metody a parametry,
     * jejich nahrani do atributu instance Routy.
    * @param    array   $choppedUrl rozsekana adresa url na jednotlive komponeny
    */
    private function setComponents($choppedUrl)
    {   
        $directoryAdmin = (CONFIG_PHP_ROOT.$this->directoryAdminName);    
        $directoryFrontend = CONFIG_PHP_ROOT.$this->directoryFrontendName;
        $firstWord = $this->stringToCamelCase($choppedUrl[0]);
         
        if(($firstWord === "Admin") and (is_dir($directoryAdmin) === true))
        {
            $this->module = $this->directoryAdminName ."\\";
            array_shift($choppedUrl);
        }
        elseif(is_dir($directoryFrontend) === true)
        {
            $this->module = $this->directoryFrontendName ."\\";
        }
        else
        {
            $this->module = "";
        }

        if(!empty($choppedUrl)){
            $choppedUrl = $this->checkRouteRedirect($choppedUrl);
        }
        
        $this->controller = $this->stringToCamelCase(array_shift($choppedUrl)) . 'Controller';
        if($this->controller === "Controller")
             $this->controller = "HomeController";
        
        if((isset($choppedUrl[0])) and (!empty($choppedUrl[0])))
            $this->method = lcfirst($this->stringToCamelCase(array_shift($choppedUrl)));
        else
            $this->method = "actionDefault";
        
        if(isset($choppedUrl[0]))
            $this->parameters = $choppedUrl;        
    }
    
    /**
    * pomocna metoda pro zmenu velikosti pismen nazvu jmena na velbloudi pismo
    * @param    string   $text retezec, ktery bude zmenen
    * @return   $name zmeneny retezec
    */
    private function stringToCamelCase($text)
    {
        $name = str_replace('-', ' ', $text); 
        $name = ucwords($name);
        $name = str_replace(' ', '', $name);
        return $name;
    }
    
    /**
    * metoda pro kontrolu a prepsani cesty v pripade, ze dana cesta se ma presmerovat 
     * v zavislosti na nastaveni v routeConfig array
    * @param    array   $choppedUrl puvodni cesta, kam miri Router
    * @return   $array s upravenou cestou
    */
    private function checkRouteRedirect($choppedUrl)
    { 
        include(CONFIG_PHP_ROOT .'scripts/common/routeConfig.php');

        foreach ($routeArray as $key => $value) {
            $choppedKeyUrl = explode("/", $key);
            $choppedValueUrl = explode("/", $value);
                        
            $keyLenght = count($choppedKeyUrl);
            $rewrite_signal = true;

            for($i = 0; $i < $keyLenght; $i++)
            {
                if($choppedUrl[$i] !== $choppedKeyUrl[$i])
                {
                    $rewrite_signal = false;
                    break;    
                }
                   
            }
            
            if($rewrite_signal === true)
            {
                for($i = 0; $i < $keyLenght; $i++)
                {
                    $choppedUrl[$i] = $choppedValueUrl[$i];
                }
            }    
        }
        return $choppedUrl;
    }
    
    /**
    * metoda pro presmerovani na spravny kontroler
    */
    public function redirect($url)
    {
        $this->route($url);
    }
    
    /**
    * metoda pro zobrazeni spravne chybove stranky a zamezeni tak cykleni presmerovai pripadnych chybejicich chybovych kotroleru
    */
    public function showError()
    {
        if(file_exists( CONFIG_PHP_ROOT.$this->directoryFrontendName .'/controller/errorController.php')) 
            $this->redirect('error/error/404'); 
        else
            header('HTTP/1.1 404 Not Found', true, 404);
            exit();
    }
}
