<form action="/objednavka/" method="post">
    <fieldset>
        <legend>Osobní údaje:</legend>
        <label for="name"><strong>*Jméno: </strong></label><input type="text" name="name" autofocus="autofocus" required ><br />
        <label for="surname"><strong>*Příjmení: </strong></label><input type="text" name="surname" autofocus="autofocus" required ><br />
        <label for="email"><strong>*E-mail: </strong></label><input type="email" name="email" id = "email" required><br />
        <label for="phone">Telefon: </label><input pattern="^(\+?(0{1,2})?(42)?0?)?\s?(([0-9]{3}[\s]?){3})$" type="text" name="phone"><br />
    </fieldset>
    <fieldset>
        <legend>Doručovací adresa:</legend>
        <label for="street"><strong>*Ulice: </strong></label><input type="text" name="street" required ><br />
        <label for="city"><strong>*Město: </strong></label><input type="text" name="city" required ><br />
        <label for="zip"><strong>*PSČ: </strong></label><input type="text" name="zip" required ><br />   
    </fieldset>
    
    <fieldset>
        <legend>Info k objednávce:</legend>
        
        <label for="radio"><strong>*Doprava: </strong></label><br>
        <input type="radio" name="shipping_method" value="self" required>Osobní vyzvednutí<br>
        <input type="radio" name="shipping_method" value="delivery">Dobírka<br>
        
        <label for="radio"><strong>*Platba: </strong></label><br>
        <input type="radio" name="payment_method" value="bank" required>Předem na účet<br>
        <input type="radio" name="payment_method" value="cash">Na pobočce<br>
        <input type="radio" name="payment_method" value="delivery">Dobírka<br>
        
        <label for="message">Poznámka k objednávce: </label><textarea name="message"></textarea>
    </fieldset>
    <div>
        <input type='hidden' name='csrf_token' value='<?php echo $_SESSION["csrf_token"]; ?>' />
        <input type="submit" value="Závazně objednat"/>
        <input type="reset" value="Vyčistit"/>
    </div>
    <div><p>*Pole označená hvězdičkou jsou povinná</p></div>
</form>

