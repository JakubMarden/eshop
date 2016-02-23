<?php

namespace AdminModule;

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
    
    protected $user;
       
    public function __construct() {
        @session_start(); 
        self::$db = \DatabaseModel::__getInstance();
        $this->user = new \User;
        if (!$this->user->isLoggedIn()) 
            $this->redirect('/admin/prihlaseni/login');
    }
    
    /**
    * ochrana csrf
    */
    protected function csrfCheck()
    {
        if((intval($this->post_data["csrf_token"]) !== $_SESSION["csrf_token"]) or (!empty($this->post_data['e-mail']))) 
        {       
            return false;
        }
        else 
        {
            return true;
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
    
    protected function redirect($url, $statusCode = 303) {
        header('Location: ' . $url, true, $statusCode);
        die();
    }
    
    public function logout(){
        $this->redirect('/admin/prihlaseni/logout');
    }
}