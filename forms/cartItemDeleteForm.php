<form action="/kosik-polozka/" method="post">
    <div>
        <input type='hidden' name='id' value='<?php echo $product["id"]; ?>' />
        <input type='hidden' name='quantity' value= "0" />
        <input type='hidden' name='csrf_token' value='<?php echo $_SESSION["csrf_token"]; ?>' />
        <input type="submit" value="odebrat z košíku">                        
    </div>
</form>

