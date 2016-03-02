<?php

namespace FrontendModule;

/**
 * Prvotni obrazovka stranek
 *
 * @author vizus.jestrab
 */
class HomeController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function actionDefault($params = null)
    {
        $this->view = 'product_list';
        $params['active'] = 1;
        $this->view_data['sort'] = array('name_asc' => 'název produktu a-z', 'name_desc' => 'název produktu z-a', 'price_asc' => 'cena od nejlevnějšího','price_desc' => 'cena od nejdražšího');
        $this->view_data['products'] = $this->initPagination('product',2, $params);
        $this->renderView();
    }
}
