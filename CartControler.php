<?php

/**
 * Description of Basket
 *
 * @author vizus.jestrab
 */
class Cart {
    
    private $info;
    
    public function __construct(Database $db)
    {  
        $this->init();
    }
    
    private function init(){
        $data = filter_input_array(INPUT_POST);
        if(isset($data["id"]))  

        session_start();
        $_SESSION["info"] = $this->info;
        header('Location: /part1/');
        exit;
    }
}