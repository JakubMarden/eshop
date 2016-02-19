<?php
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
        
       
    /**
    * dela samotnou zmenu v kosiku
    */
    protected function init()
    {
        
        $this->quantity = intval($this->data['quantity']);
        $this->id = intval($this->data['id']);        
        
        //odebrani z kosiku
        if($this->quantity === 0)
        {
            unset($_SESSION["cart_products"][$this->id]);
            $this->info = "Produkt byl odebrán z košíku.";
            header('Location: /kosik/');
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
        $this->source = $this->data['source']; 
        
        if($this->data['source'] === "kosik")
            $this->info = "Počet byl upraven.";
        else
            $this->info = "Produkt byl přidán do košíku.";
    }
}

$cart_item = new CartItemController();

$_SESSION["info"] = $cart_item->info;

if($cart_item->source === "kosik")
    header('Location: /kosik/');     
else
    header('Location: /');  

exit;
