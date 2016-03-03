<?php

/**
 * Trida zjistujici a udrzujici info o uzivateli, prihlasujicim se do adminu
 *
 * @author vizus.jestrab
 */
class User {
    
    /** @var string Obsahuje informaci o uzivatelskem jmene. */
    public $username;
    
    /** @var string Obsahuje informaci o pravech daneho uzivatele. */
    public $rights;
    
    /** @var Database instance. */
    protected static $db; 
    
    public function __construct() 
    {
        @session_start();
    }
    
    /**
    * metoda zjistovani, zda je uzivatel prihlasen
    * @return   boolean
    */
    public function isLoggedIn()
    {
        if((isset($_SESSION['username'])) AND (isset($_SESSION['rights'])))
        {
            $this->username = $_SESSION['username'];
            $this->rights = $_SESSION['rights'];
            return true;
        }
        else 
            return false;
    }
    
    /**
    * metoda pro zjisteni, zda prihlasovany uzivatel ma pravo na vstup do admina
    * @param    array   $credentials vyplnene udaje v prihlasovacim formulari
    */
    public function authenticate(array $credentials)
    {
        self::$db = \DatabaseModel::getInstance();
        $username = $credentials['username'];
        $password = $credentials['password'];
        $row = self::$db->getUser($username);
        
        if($row)
        {
            $password_is_correct = password_verify($password, $row['password']);
            if ($password_is_correct !== true) 
            {
                throw new Exception('Špatně zadané heslo');
            }
            else 
            {
                $_SESSION['username'] = $row['username'];
                $_SESSION['rights'] = $row['rights_level'];             
            }
        }
        else
        {
                throw new Exception('Špatně zadané jméno');
        }
    }
}
