<div class = "fright"><a href = "/" title ="přejít do listu produktů">List produktů</a></div>
<h2>Košík</h2>
<?php if(!empty($_SESSION["cart_products"])){?>
<table>
    <thead>
        <tr>
            <th>Název produktu</th>
            <th>Detail produktu</th>
            <th>Cena včetně daně</th>
            <th>Daň: </th>
            <th>Počet balení</th>
            <th>Celková cena položky</th>
            
            <th>Změnit počet balení na</th>
            <th>Odebrat produkt z košíku</th>
        </tr>
    </thead>
    <tbody>
        <?php $sum_price = 0;
        foreach($_SESSION["cart_products"] as $product){ 
            
            $item_price = ($product["price"] * $product["quantity"]); 
            $sum_price += $item_price;       ?>
        
            <tr>                              
                <td><?php echo $product["name"] ?></td>
                <td><?php echo "<a href = \" /detail/$product[id]\">detail produktu</a>" ?></td>
                <td><?php echo $product["price"]." Kč" ?></td>
                <td><?php echo $product["vat"]." %" ?></td>
                <td><?php echo $product["quantity"] ?></td> 
                <td><?php echo $item_price." Kč" ?></td>
                
                <td><?php include('../forms/cartItemUpdateForm.php')?></td>
                <td><?php include('../forms/cartItemDeleteForm.php')?></td>
            </tr>    
        <?php } //endforeach ?>
            
            <tr>
                <td colspan="8"><strong><?php echo "Celková cena: " .round($sum_price)." Kč" ?></strong></td> 
            </tr>    
    </tbody>  
</table><br/>

<h2>Objednávací údaje</h2>
<?php include('../forms/cartOrderForm.php');
}
else
    echo "<p>Nebyly zatím vybrány žádné produkty.</p>"
?>


