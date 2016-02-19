<?php

namespace FrontendModule;

/**
 * Description of BaseController
 *
 * @author vizus.jestrab
 */

abstract class BaseController 
{
    /** @var array Obsahuje data vyvolavajici zmenu dat pomoci controlleru. */
    protected $post_data;
    
    /** @var string Obsahuje informaci, jake view controller pouzije. */
    protected $view;
    
    /** @var array Obsahuje data pro zobrazeni ve view. */
    protected $view_data;
    
    /** @var Database instance. */
    protected static $db;    
    
    /** @var string hlaska, ktera bude zobrazena zakaznikovi. */
    public $info;
       
    public function __construct() {
        @session_start();
        //require(dirname(__FILE__).'/../../model/'.'DatabaseModel.php'); 
        self::$db = \DatabaseModel::__getInstance();
        $this->post_data = filter_input_array(INPUT_POST);
        if($this->post_data)
            $this->csrfCheck();
    }
    
    /**
    * ochrana csrf
    */
    protected function csrfCheck()
    {
        if((intval($this->data["csrf_token"]) !== $_SESSION["csrf_token"]) or (!empty($this->data['e-mail']))) 
        {       
            $this->info = ".Akce se nepovedla, prosím obnovte stránku a zkuste to znovu."; 
            header('Location: /');
            exit;
        }
        else 
        {
            $this->init();  
        }           
    }
     
    
    public function renderView()
    {
        //$_SESSION["info"] zobrazuje vysledek operaci, paklize se nejake udaly
        if((isset($_SESSION["info"])) && (!empty($_SESSION["info"]))){
            $this->view_data["info"] = $_SESSION["info"];
            $_SESSION["info"] = null;
        }               

        //generuje csrf token pro formulare
        if (!isset($_SESSION["csrf_token"])) {
            $_SESSION["csrf_token"] = rand(1, 1e9);
        }
                
        if ($this->view)
        {
            $this->view_data["view"] = $this->view;
            extract($this->view_data);
            $main_template = (dirname(__FILE__) .'/../view/@layout.phtml');
            
            if(file_exists($main_template))
                require_once($main_template);     
        }
    }
    
    public function redirect($url) {
        $router = new Router($url);
        $router->redirect();
    }
}

