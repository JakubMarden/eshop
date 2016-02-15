<?php

include('../model/Database.php');
$db = new Database;
$product = $db->getRowByID("product",$detail_id);
$image_file = "/photos/".$product['image_file'];


?>  

<h2>Detail produktu</h2>
<div>
    <?php echo "produkt kód: " .$product["id"] ?><br />
    <?php echo "název: " .$product["name"] ?><br />
    <?php if(!empty($product["description"]))echo "popis: " .$product["description"] ?><br />
    <?php echo "cena: " .$product["price"] ?><br />
    <?php echo "daň: " .$product["vat"]."%" ?><br />
    <?php echo "množství v balení: " .$product["mount"] ?><br />
    <?php if(file_exists($image_file)) echo "<img src = '$image_file' alt = 'obrázek produktu'/>" ?><br />
    
    <?php include('../forms/cartItemUpdateForm.php')?>
</div>

