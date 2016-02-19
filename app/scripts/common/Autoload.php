<?php

/**
 * Description of Autoload
 *
 * @author vizus.jestrab
 */
class Autoload
{   
    public $module = "";
    
    public $class;
    
    public function __construct() {
        $this->autoloadProcess();
    }
    
    public function autoloadProcess()
    {
        spl_autoload_register(function($input)
        {   
            if (preg_match('/Module/', $input))
            {
                ltrim($input, "\\");
                $sliced_class = explode("\\", $input);
                $this->module = array_shift($sliced_class);
                $this->module = $this->module ."\\";
                $this->class = implode($sliced_class);        
            }
            else {
                $this->class = $input;       
            }

            if (preg_match('/Controller$/', $this->class))
                require(CONFIG_PHP_ROOT .  $this->module ."controller\\" . $this->class . ".php");
            elseif(preg_match('/Model$/', $this->class))
                require(CONFIG_PHP_ROOT ."model\\" . $this->class . ".php");
            else
                require(CONFIG_PHP_ROOT."/scripts/common/" . $this->class . ".php");
        });
    }
    
}
new Autoload();
