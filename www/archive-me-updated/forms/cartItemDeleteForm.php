<form action="/kosik-polozka/" method="post">
    <div>
        <input type='hidden' name='id' value='<?php echo $product["id"]; ?>' >
        <input type='hidden' name='quantity' value= "0" >
        <div class ="nor"><label for ="e-mail">nevyplňujte prosím: </label><input type="text" name="e-mail" value=""></div>
        <input type='hidden' name='csrf_token' value='<?php echo $_SESSION["csrf_token"]; ?>' >
        <input type="submit" value="odebrat z košíku">                        
    </div>
</form>

