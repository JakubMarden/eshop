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
        self::$db = \DatabaseModel::getInstance();
        $this->post_data = filter_input_array(INPUT_POST);
        
        if($this->post_data){
            $this->csrfCheck();
            $this->post_data = $this->validateInput($this->post_data);
        }
        
        $get_data = filter_input_array(INPUT_GET);
        if($get_data){
            $get_data = $this->validateInput();
        }
    }
    
    /**
    * ochrana csrf
    */
    protected function csrfCheck()
    {
        if((intval($this->post_data["csrf_token"]) !== $_SESSION["csrf_token"]) or (!empty($this->post_data['e-mail']))) 
        {       
            $this->info = ".Akce se nepovedla, prosím obnovte stránku a zkuste to znovu."; 
            $this->redirect('/');
        }
    }
    
    /**
    * ochrana proti sql injection atp
    */
    protected function validateInput($data_input)
    {
        foreach($data_input as $key => $data)
        {
            $data = trim($data);
            $data = stripslashes($data);
            $data = htmlspecialchars($data);
            $data_input[$key] = $data;
        }
        return $data_input;
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
    
    protected function initPagination($source,$limit,$params)
    {
        if(isset($params[0]))
        {
            $params['page'] = $params[0];
        }
        
        if(isset($this->post_data['sort']))
        {            
            $order = explode('_',$this->post_data['sort']);
            $params['order_by'] = $_SESSION['order_by'] = $order[0];
            $params['order_direction'] = $_SESSION['order_direction'] = $order[1];
        }
        elseif (isset($_SESSION['order_by'])) 
        {
            $params['order_by'] = $_SESSION['order_by'];
            $params['order_direction'] = $_SESSION['order_direction'];
        }
            
        $pagination = new \Pagination();
        $data = $pagination->getData($source,$limit, $params);
        
        if($pagination->total > $pagination->limit)
        {
            $this->view_data['pagination_count'] = intval(ceil($pagination->total / $pagination->limit));
            $this->view_data['pagination_actual_page'] = $pagination->page;            
        }

        return $data;
    }
    
    protected function redirect($url) {
        $router = new \Router();
        $router->redirect($url);
    }
}