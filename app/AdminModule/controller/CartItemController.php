<?php

namespace AdminModule;

/**
 * CartItemController obsluhuje zmenu dat v kosiku u jedne polozky
 *
 * @author vizus.jestrab
 */

class CartItemController extends BaseController
{
    
    /** @var int id produktu. */
    private $id;
    
    /** @var int mnozstvi objednavaneho produktu. */
    private $quantity;
    
     /** @var string hlaska, ktera bude zobrazena zakaznikovi. */
    public $info;
    
     /** @var string obsahuje info z jake stranky data prisla. */
    public $source;
 
    public function __construct() {
        parent::__construct();
    }
       
    /**
    * dela samotnou zmenu v kosiku
    */
    public function changeInCart()
    {      
        $this->quantity = intval($this->post_data['quantity']);
        $this->id = intval($this->post_data['id']);        
        
        //odebrani z kosiku
        if($this->quantity === 0)
        {
            unset($_SESSION["cart_products"][$this->id]);
            $this->info = $_SESSION['info'] = "Produkt byl odebrán z košíku.";
            $this->redirect('kosik/');
            exit;
        }            
        
        //pridani nebo uprava poctu kusu v kosiku
        if(!isset($_SESSION["cart_products"][$this->id]))
        {
            $product = parent::$db->getRowByID("product", $this->id);
            if(!empty($product)){
                $_SESSION["cart_products"][$this->id] = $product;         
            }
        }   
        
        $_SESSION["cart_products"][$this->id]["quantity"] = $this->quantity;
        $this->source = $this->post_data['source']; 
        
        if(($this->source === "kosik") or ($this->source === "cart"))
        {
            $this->info = "Počet byl upraven.";
            $_SESSION['info'] = $this->info;
            $this->redirect('kosik/');
        }
        else
        {    
            $this->info = "Produkt byl přidán do košíku.";
            $_SESSION['info'] = $this->info; 
            $this->redirect('/'); 
        }                    
    }
}