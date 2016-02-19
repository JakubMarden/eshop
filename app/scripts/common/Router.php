<?php


class Router
{
    private $module;

    private $controller;
    
    private $method;

    private $parameters;
    
    private $directoryFrontendName = 'FrontendModule';
    
    private $directoryAdminName = 'AdminModule';

    public function route($url)
    {
        $choppedUrl = $this->parseUrl($url); 
        $this->setComponents($choppedUrl);
        $this->initRoute();
    }
    
    private function parseUrl($url)
    {
        $parsedUrl = parse_url($url);
        $parsedUrl["path"] = ltrim($parsedUrl["path"], "/");
        $parsedUrl["path"] = trim($parsedUrl["path"]);   
        return $choppedUrl = explode("/", $parsedUrl["path"]);       
    }
    
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
                $this->redirect('error/error/404'); 
        }
        else
            $this->redirect('error/error/404'); 

    }        


    
    private function setComponents($choppedUrl)
    {   
        $directoryAdmin = (CONFIG_PHP_ROOT.$this->directoryAdminName);    
        $directoryFrontend = CONFIG_PHP_ROOT.$this->directoryFrontendName;
        $firstWord = $this->stringToCamelCase($choppedUrl[0]);
        
        if(($firstWord = "Admin") and (is_dir($directoryAdmin) === true))
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
        include(CONFIG_PHP_ROOT .'scripts/common/routeConfig.php');
        foreach ($routeArray as $key => $value) {
            if($key === $choppedUrl[0])
                $choppedUrl[0] = $value;
        }
        
        $this->controller = $this->stringToCamelCase(array_shift($choppedUrl)) . 'Controller';
        if($this->controller === "Controller")
             $this->controller = "HomeController";
        
        if(isset($choppedUrl[0]))
            $this->method = lcfirst($this->stringToCamelCase(array_shift($choppedUrl)));
        else
            $this->method = "actionDefault";
        
        if(isset($choppedUrl[0]))
            $this->parameters = $choppedUrl;        
    }
    
    private function stringToCamelCase($text)
    {
        $name = str_replace('-', ' ', $text); 
        $name = ucwords($name);
        $name = str_replace(' ', '', $name);
        return $name;
    }
    
    public function redirect($url)
    {
        header("Location: /$url");
        header("Connection: close");
        exit;
    }
}
