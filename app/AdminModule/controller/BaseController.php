<?php

namespace AdminModule;

/**
 * Zakladni kontroler s pomocnymi metodami a automatickym zabezpecenim
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
    
    /** @var instance prihlaseneho uzivatele. */
    protected $user;
       
    public function __construct() {
        @session_start(); 
        self::$db = \DatabaseModel::getInstance();
        $this->user = new \User;
        $is_logged_in = $this->user->isLoggedIn();
        
        if ($is_logged_in === false)
        { 
            $this->redirect('/admin/prihlaseni/login');
        }
        
        $this->post_data = filter_input_array(INPUT_POST);
        
        if($this->post_data){
            $csrfCheck = $this->csrfCheck();
            
            if($csrfCheck === false)
            {
                $this->info = $_SESSION['info'] = "Akce se nepovedla, prosím obnovte stránku a zkuste to znovu."; 
                $this->redirect('/admin/');
            }
            
            $this->post_data = $this->validateInput($this->post_data); 
        }
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
            unset($this->post_data["csrf_token"]);
            unset($this->post_data['e-mail']);
            return true;
        }
    }
   
    /**
    * metoda pro zobrazeni pohledu
    */
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
    
    /**
    * metoda pro spusteni strankovani
    * @param    string   $source nastavuje z jake tabulky se budou tahat strankvana data
    * @param    int   $limit
    * @param    array  $params
    * @return   $array
    */
    protected function initPagination($source,$limit,$params)
    {
        if(isset($params[0]))
        {
            $params['page'] = $params[0];
        }
        
        if(isset($this->post_data['sort']))
        {            
            $order = explode('_',$this->post_data['sort']);
            $params['order_by'] = $_SESSION['user_order_by'] = $order[0];
            $params['order_direction'] = $_SESSION['user_order_direction'] = $order[1];
        }
        elseif (isset($_SESSION['user_order_by'])) 
        {
            $params['order_by'] = $_SESSION['user_order_by'];
            $params['order_direction'] = $_SESSION['user_order_direction'];
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
    
    /**
    * ochrana proti sql injection atp
    * @param    array   $data_input pole dat k validaci
    * @return   $array vraci to same pole ocistene
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
    
    /**
    * funkce pro presmerovani
    * @param    string   $url misto presmerovani
    * @param    int $statusCode kod stranky k urceni typu presmerovani
    */
    protected function redirect($url, $statusCode = 303) {
        header('Location: ' . $url, true, $statusCode);
        die();
    }
  
    /**
    * odhlaseni z admina
    */
    public function logout(){
        $this->redirect('/admin/prihlaseni/logout');
    }
}