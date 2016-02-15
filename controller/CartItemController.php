<?php

/**
 * Description of BasketItem
 *
 * @author vizus.jestrab
 */

class CartItemController {
    
    private $data;
    private $id;
    private $quantity;
    public $info;
    private $db;
    
    
    public function __construct(Database $db)
    {
        @session_start();
        $this->db = $db;
        $this->data = filter_input_array(INPUT_POST);
        if($this->data)
            $this->updateCartCheck();
    }
    
    private function updateCartCheck()
    {
        if(intval($this->data["csrf_token"]) !== $_SESSION["csrf_token"])        
            $this->info = "Produkt se nepovedlo vložit do košíku. Prosím obnovte stránku a zkuste to znovu.";        
        else
            $this->updateCart();
    }
    
    private function updateCart()
    {
        
        $this->quantity = intval($this->data['quantity']);
        $this->id = intval($this->data['id']);        
        
        if($this->quantity === 0){
            unset($_SESSION["cart_products"][$this->id]);
            $this->info = "produkt byl odebrán z košíku";
            exit;
        }            
        
        if(!isset($_SESSION["cart_products"][$this->id]))
        {
            $product = $this->db->getRowByID("product", $this->id);
            $_SESSION["cart_products"][$this->id] = $product;         
        }   
        
        $_SESSION["cart_products"][$this->id]["quantity"] = $this->quantity;
        $this->info = "produkt byl přidán do košíku";
    }
}

include('../model/Database.php');
$db = new Database;
$cart_item = new CartItemController($db);

$_SESSION["info"] = $cart_item->info;
header('Location: /');
exit;
