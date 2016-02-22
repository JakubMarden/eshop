<?php

namespace FrontendModule;

/**
 * Prvotni obrazovka stranek
 *
 * @author vizus.jestrab
 */
class ProductController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    public function detail($params)
    {
        $detail_id = intval($params[0]);
        $this->view = 'product_detail';
        $this->view_data['product'] = parent::$db->getRowByID("product",$detail_id);
        $this->renderView();
    }
}
