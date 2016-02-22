<?php
if(!isset($product['quantity'])) 
    $product['quantity']= 1
?>

<form action="/kosik-polozka/" method="post">
    <div>
        <?php if(isset($detail_id)) echo'<label for="quantity">počet balení: </label>';?> 
        <input type="text" size = "3" name="quantity" pattern= "^([0-9])+$" value="<?php echo $product['quantity'] ?>">
        <input type='hidden' name='id' value='<?php echo $product["id"]; ?>' />
        <input type="hidden" name="source" value="<?php echo $source; ?>">
        <div class ="nor"><label for ="e-mail">nevyplňujte prosím: </label><input type="text" name="e-mail" value=""></div>
        <input type='hidden' name='csrf_token' value='<?php echo $_SESSION["csrf_token"]; ?>' />
        <input type="submit" value="do košíku">                        
    </div>
</form>

