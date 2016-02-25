<?php

/**
 * Description of User
 *
 * @author vizus.jestrab
 */
class User {
    
    public $username;
            
    public $rights;
    
    /** @var Database instance. */
    protected static $db; 
    
    public function __construct() 
    {
        @session_start();
    }
    
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
    
    public function authenticate(array $credentials)
    {
        self::$db = \DatabaseModel::__getInstance();
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
                $_SESSION['rights'] = $row['rights_id'];             
            }
        }
        else
        {
                throw new Exception('Špatně zadané jméno');
        }
    }
}
