<?php

namespace FrontendModule;
/**
 * Description of ErrorController
 *
 * @author vizus.jestrab
 */

class ErrorController extends BaseController
{
    public function __construct() {
        parent::__construct();
    }
    
   public function error($params)
   {
        $id = intval($params[0]);
        if($id === 404){
            header("HTTP/1.0 404 Not Found");    
        }
        // Hlavička stránky
        $this->view_data['title'] = "Chyba $id";
        // Nastavení šablony
        $this->view = 'error_'.$id;
        
        $this->renderView();
   }
    
}
