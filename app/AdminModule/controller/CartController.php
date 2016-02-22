<?php

namespace AdminModule;

/**
 * Prvotni obrazovka stranek
 *
 * @author vizus.jestrab
 */
class CartController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function actionDefault()
    {
        $this->view = 'cart';
        $this->renderView();
    }
}
