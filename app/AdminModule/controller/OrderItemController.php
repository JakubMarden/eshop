<?php

namespace AdminModule;

/**
 * OrderItemController obsluhuje ulozeni objednavky z kosiku
 *
 * @author vizus.jestrab
 */

class OrderItemController extends BaseController
{
    
    /** @var int id objednavky. */
    private $id;
    
    /** @var array data o zakaznikovi. */
    private $customer;
    
    /** @var array data o objednavce jako takove. */
    private $order;
    
    /** @var array data o produktech uvnitr objednavky. */
    private $products;
    
    /** @var int cena za dopravu. */
    private $shipping_price;
    
    /** @var int cena za platbu. */
    private $payment_price;
    
    /** @var int celkova cena. */
    private $sum_price;

    public function __construct() {
        parent::__construct();
    }    
    
    /**
    * uklada objednavku
    */
   public function actionDefault()
   {        
        $this->insertCustomer();
            
        $this->setPricesAndProducts();
        $this->insertOrder();
        
        $this->insertProductsInOrder();
        
        unset($_SESSION["cart_products"]);
        $_SESSION["info"] = $this->info = "Objednávka je uložena, děkujeme za nákup v našem e-shopu.";
        $this->redirect('kosik/'); 
    }
    
    /**
    * uklada zakaznika k objednavce
     * 
    * @return   boolean
    */
    private function insertCustomer()
    {
        $max_id  = parent::$db->getMaxId("customer");
        $max_id++;

        $this->customer = array(
            "id" => $max_id,
            "name" => $this->post_data['name'],
            "surname" => $this->post_data['surname'],
            "email" => $this->post_data['email'],
            "phone" => $this->post_data['phone'],
            "street" => $this->post_data['street'],
            "city" => $this->post_data['city'],
            "zip" => $this->post_data['zip']
        );
         
        $save_customer_result = parent::$db->insertRow("customer", $this->customer); 
        
        if($save_customer_result === false)
        {
            $_SESSION["info"] = $this->info = "Objednávku se nepovedlo uložit. Zkuste to prosím znovu.";
            $this->redirect('kosik/');  
        }
    }
    
    /**
    * uklada samotnou objednavku
     * 
    * @return   boolean
    */
    private function insertOrder()
    {
        $max_id  = intval(parent::$db->getMaxId("order"));
        $max_id++;
              
        $this->order = array(
            "id" => $max_id,
            "customer_id" => $this->customer['id'],
            "status" => "nova",
            "shipping_method" => $this->post_data['shipping_method'],
            "payment_method" => $this->post_data['payment_method'],
            "shipping_price" => $this->shipping_price,
            "payment_price" => $this->payment_price,
            "sum_price" => $this->sum_price,
            "message" => $this->post_data['message']
        );
        
        $save_order_result = parent::$db->insertRow("order", $this->order); 
        
        if($save_order_result === false)
        {
            $_SESSION["info"] = $this->info = "Objednávku se nepovedlo uložit. Zkuste to prosím znovu.";
            $this->redirect('kosik/'); ;
        }       
    }
    
     /**
    * uklada produkty z objednavky a ukoncuje cinnost
     * 
    * @return   boolean
    */
    private function insertProductsInOrder()
    {
        foreach ($this->products as $value) 
        {
            $products = array(
                "order_id" => $this->order['id'],
                "product_id" => $value['id'],
                "price" => $value['price'],
                "vat" => $value['vat'],
                "quantity" => $_SESSION["cart_products"][$value['id']]["quantity"]
            );
            
            $save_product_result = parent::$db->insertRow("product_in_order", $products);
            
            if($save_product_result === false)
            {
                $_SESSION["info"] = $this->info = "Objednávku se nepovedlo uložit. Zkuste to prosím znovu.";
                header('Location: /kosik/');  
                exit;
            }               
        }  
    }        
    
    
    /**
    * zjistuje a udrzuje cenu objednavky a naplnuje promennou produktu v objednavce
    */
    private function setPricesAndProducts() 
    {
        $this->shipping_price = 0;
        $this->payment_price = 0;
        $this->sum_price = 0;
        
        foreach ($_SESSION["cart_products"] as $value) 
        {
            //ochrana pred zmenou cen v prubehu objednavky a take pred podstrcenymi cenami
            $this->products[$value['id']] = parent::$db->getRowByID('product', $value["id"]);  
            $this->sum_price += ($value["quantity"] * $this->products[$value['id']]["price"]);
        }   
        
        $this->sum_price = round($this->sum_price + $this->payment_price + $this->shipping_price);    
    }
}
