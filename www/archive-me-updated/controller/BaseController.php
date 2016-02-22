<?php
require(dirname(__FILE__).'/../model/'.'Database.php'); 
/**
 * Description of BaseController
 *
 * @author vizus.jestrab
 */

class BaseController 
{
    /** @var array Obsahuje data vyvolavajici zmenu dat pomoci controlleru. */
    protected $data;
    
    /** @var Database instance. */
    protected static $db;    
    
    /** @var string hlaska, ktera bude zobrazena zakaznikovi. */
    public $info;
       
    public function __construct() {
        @session_start();
        self::$db = Database::__getInstance();
        $this->data = filter_input_array(INPUT_POST);
        if($this->data)
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
    
    /**
    * metoda pro samotnou cinnost controlleru
    */
    protected function init() { }   
}

new BaseController();
