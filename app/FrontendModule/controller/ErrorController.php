<?php


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
    
   public function error($id)
   {
       if($id === 404){
       header("HTTP/1.0 404 Not Found");    
       }
        // Hlavička stránky
        $this->data['title'] = "Chyba $id";
        // Nastavení šablony
        $this->view = 'error_'.$id;
   }
    
}
