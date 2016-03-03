<?php

namespace AdminModule;

/**
 * Prvotni obrazovka adminu
 *
 * @author vizus.jestrab
 */
class HomeController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function actionDefault()
    {
        $this->view = 'welcome';
        $this->view_data['user'] = parent::$db->getAll("user");
        $this->renderView();
    }
}
