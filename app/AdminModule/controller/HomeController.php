<?php

namespace AdminModule;

/**
 * Prvotni obrazovka stranek
 *
 * @author vizus.jestrab
 */
class HomeController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function actionDefault()
    {
        $this->view = 'product_list';
        $this->view_data['user'] = parent::$db->getAllActive("user");
        $this->renderView();
    }
}
