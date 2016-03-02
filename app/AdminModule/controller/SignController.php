<?php

namespace AdminModule;

/**
 * Prihlaseni uzivatele do admina
 *
 * @author vizus.jestrab
 */
class SignController extends BaseController
{
    public $user;
    
    public function __construct() 
    {
        @session_start();
    }
    
    public function in()
    {
        $this->view = 'sign_in';
        $this->renderView();
    }
    
    public function autenticate()
    {       
        $this->post_data = filter_input_array(INPUT_POST);
        $csrf_check = $this->csrfCheck();
 
        if(!empty($this->post_data) and ($csrf_check ===true))
        {
            try {
                $this->user = new \User;
                $this->user->authenticate($this->post_data);
                $this->info = $_SESSION['info'] = 'Přihlášení bylo úspěšné.';
                $this->redirect('/admin/');                              
            }
            catch (\Exception $e) {
                $this->info = $_SESSION['info'] = $e->getMessage();
                $this->redirect('/admin/prihlaseni/login');
            } 
        }
        else
        {    
            $this->info = $_SESSION['info'] = "Akce se nepovedla, prosím obnovte stránku a zkuste to znovu."; 
            $this->redirect('/admin/prihlaseni/login');
        }    
    }
    
    public function logout()
    {
        unset($_SESSION['username']);
        unset($_SESSION['rights']);
        $_SESSION["info"] = "Odhlášení proběhlo úspěšně";
        $this->redirect('/admin/prihlaseni/login');
    }
}
