<?php
require(dirname(__FILE__).'/'.'BaseController.php'); 

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
    
    
    /**
    * uklada objednavku
    */
   protected function init()
   {
        //
        
        $this->insertCustomer();
            
        $this->setPricesAndProducts();
        $this->insertOrder();
        
        $this->insertProductsInOrder();
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
            "name" => $this->data['name'],
            "surname" => $this->data['surname'],
            "email" => $this->data['email'],
            "phone" => $this->data['phone'],
            "street" => $this->data['street'],
            "city" => $this->data['city'],
            "zip" => $this->data['zip']
        );
         
        $save_customer_result = parent::$db->insertRow("customer", $this->customer); 
        
        if($save_customer_result === false)
        {
            $_SESSION["info"] = $this->info = "Objednávku se nepovedlo uložit. Zkuste to prosím znovu.";
            header('Location: /kosik/');  
            exit;
        }
    }
    
    /**
    * uklada samotnou objednavku
     * 
    * @return   boolean
    */
    private function insertOrder()
    {
        $max_id  = parent::$db->getMaxId("order");
        $max_id++;
        $id = sprintf("%'.06d\n", $max_id);
              
        $this->order = array(
            "id" => $id,
            "customer_id" => $this->customer['id'],
            "status" => "nova",
            "shipping_method" => $this->data['shipping_method'],
            "payment_method" => $this->data['payment_method'],
            "shipping_price" => $this->shipping_price,
            "payment_price" => $this->payment_price,
            "sum_price" => $this->sum_price
        );
        
        $save_order_result = parent::$db->insertRow("order", $this->order); 
        
        if($save_order_result === false)
        {
            $_SESSION["info"] = $this->info = "Objednávku se nepovedlo uložit. Zkuste to prosím znovu.";
            header('Location: /kosik/');  
            exit;
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
    
    public function __destruct() {
        unset($_SESSION["cart_products"]);
        $_SESSION["info"] = $this->info = "Objednávka je uložena, děkujeme za nákup v našem e-shopu.";
        header('Location: /');  
        exit;
    }
}

new OrderItemController();

