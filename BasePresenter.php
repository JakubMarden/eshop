<?php

/**
 * Description of BasePresenter
 *
 * @author vizus.jestrab
 */
class BasePresenter 
{
    private $db;
    
    public function __construct() {
        $db = new Database();
        $this->db = $db;
    }
}
