<?php

namespace AdminModule;

/**
 * Admin produktu
 *
 * @author vizus.jestrab
 */
class ProductController extends BaseController{
    
    public function __construct() {
        parent::__construct();
    }
    
    /**
    * defaultni obrazovka listu produktu
    * @param    string   $source nastavuje z jake tabulky se budou tahat strankvana data
    * @param    array   $params priprava na pripadne nastaveni strankovani atp.
    */
    public function actionDefault($params = null)
    {
        $this->view = 'product_list';
        $this->view_data['sort'] = array('name_asc' => 'název produktu a-z', 'name_desc' => 'název produktu z-a', 'price_asc' => 'cena od nejlevnějšího','price_desc' => 'cena od nejdražšího');
        $this->view_data['products'] = $this->initPagination('product',null, $params);
        $this->renderView();
    }
    
    /**
    * metoda pro pridani produktu
    */
    public function add()
    {
        if(!isset($this->post_data['name']))        //paklize jeste nebyl odeslan formular s daty  tedy prvni faze pridavani 
        {
            $this->view = 'product_add'; 
            $this->renderView();
        }
        else                                          //prisla data z formulare, tedy druha faze pridavani
        {
            $_SESSION['info'] = "";
            if(isset($_FILES["image_file"]['name']) and (!empty($_FILES["image_file"]['name'])))
            {
                $this->uploadImage();
            }
            
            parent::$db->lockTable("product");
            $save_product_result = parent::$db->insertRow("product", $this->post_data);
            parent::$db->unlockTable("product");
            
            if($save_product_result === true)
            {
                $_SESSION["info"] .= $this->info = "Produkt byl uložen.\n";
                $this->redirect('/admin/product/'); 
            }    
            else
            {
                new Log(parent::$db->error);
                $_SESSION["info"] .= $this->info = "Produkt se nepovedlo uložit. Zkuste to prosím znovu.\n";
                $this->redirect('/admin/product/add/');  
            }               
        }
    }
    
    /**
    * metoda pro editaci produktu
    * @param    array   $params obsahuje id produktu k editaci
    */
    public function edit($params)
    {
        $id = $params[0];
        if(!isset($this->post_data['name']))        //paklize jeste nebyl odeslan formular s daty  tedy prvni faze pridavani 
        {
            $this->view_data['product'] = parent::$db->getRowByID('product',$id);   
            $this->view = 'product_edit'; 
            $this->renderView();
        }
        else                                          //prisla data z formulare, tedy druha faze pridavani
        {
            $_SESSION['info'] = "";
            if(isset($_FILES["image_file"]['name']) and (!empty($_FILES["image_file"]['name'])))
            {
                $this->uploadImage();
            }
            
            unset($this->post_data['image_file_old']); 
            parent::$db->lockTable("product");
            $save_product_result = parent::$db->updateRow("product", $this->post_data, $id);
            parent::$db->unlockTable("product");
            
            if($save_product_result === true)
            {
                $_SESSION["info"] .= $this->info = "Produkt byl uložen.\n";
                $this->redirect('/admin/product/'); 
            }    
            else
            {
                new Log(parent::$db->error);
                $_SESSION["info"] .= $this->info = "Produkt se nepovedlo uložit. Zkuste to prosím znovu.\n";
                $this->redirect("/admin/product/edit/$id");  
            }               
        }
    }
    
    /**
    * metoda pro smazani produktu
    * @param    array   $params obsahuje id produktu ke smazani
    */
    public function delete($params)
    {
        $product = parent::$db->getRowByID('product', $params[0]);
        unlink(CONFIG_ROOT ."/photos/".$product['image_file']);
        $delete_signal = parent::$db->deleteRow('product', $params[0]);
 
        if($delete_signal === true)
        {
            $_SESSION["info"] .= $this->info = "Produkt byl úspěšně smazán.\n";
            $this->redirect('/admin/product/'); 
        }    
        else
        {
            new Log(parent::$db->error);
            $_SESSION["info"] .= $this->info = "Produkt se nepovedlo smazat. Zkuste to prosím znovu.\n";
            $this->redirect('/admin/product/');  
        }
    }
    
    /**
    * metoda pro zobrazeni detailu
    * @param    array   $id obsahuje id produktu k zobrazeni
    */
    public function detail($id)
    {
        $detail_id = intval($id[0]);
        $this->view = 'product_detail';
        $this->view_data['product'] = parent::$db->getRowByID("product",$detail_id);
        $this->renderView();
    }
    
    /**
    * metoda pro zpracovani obrazku produktu
    */
    public function uploadImage()
    {        
        $errors= '';
        $file_name = $_FILES['image_file']['name'];
        $file_size =$_FILES['image_file']['size'];
        $file_tmp =$_FILES['image_file']['tmp_name'];
        $file_ext=strtolower(end(explode('.',$file_name)));

        $expensions= array("jpeg","jpg","png","bmp");

        if(in_array($file_ext,$expensions)=== false){
           $errors.="tento typ obrazku neni povolen, prosime pouzijte format jpg, png, nebo bmp.\n";
        }

        if($file_size > 2097152){
           $errors[].='Velikost souboru presahuje 2 MB\n';
        }

        if(empty($errors)==true)
        {
            move_uploaded_file($file_tmp,CONFIG_ROOT ."/photos/".$file_name);
            $this->post_data['image_file'] = $file_name;
            $_SESSION['info'] =  "Soubor $file_name byl nahran\n";
            var_dump($this->post_data['image_file_old']);
            if((isset($this->post_data['image_file_old'])) and (!empty($this->post_data['image_file_old'])) and (  file_exists(CONFIG_ROOT .'/photos/'.$this->post_data['image_file_old'])))
            {
                unlink(CONFIG_ROOT .'/photos/'.$this->post_data['image_file_old']);
            }
        }
        else
        {
           $_SESSION['info'] = $errors;
        }
    }
}
