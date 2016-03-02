<?php

namespace AdminModule;

/**
 * Prvotni obrazovka stranek
 *
 * @author vizus.jestrab
 */
class ProductController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function actionDefault($params = null)
    {
        $this->view = 'product_list';
        $this->view_data['sort'] = array('name_asc' => 'název produktu a-z', 'name_desc' => 'název produktu z-a', 'price_asc' => 'cena od nejlevnějšího','price_desc' => 'cena od nejdražšího');
        $this->view_data['products'] = $this->initPagination('product',null, $params);
        $this->renderView();
    }
    
    public function add()
    {
        if(!isset($this->post_data['name']))
        {
            $this->view = 'product_add'; 
            $this->renderView();
        }
    }        
}
