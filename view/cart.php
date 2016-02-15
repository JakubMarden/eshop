<h2>Košík</h2>
<table>
    <thead>
        <tr>
            <th>název produktu</th>
            <th>cena včetně daně</th>
            <th>daň: </th>
            <th>detail produktu</th>
            <th>počet balení</th>
            <th>změnit počet balení na</th>
            <th>odebrat produkt z košíku</th>
        </tr>

        <?php var_dump($_SESSION["cart_products"]);
        foreach($_SESSION["cart_products"] as $product){ ?>
            <tr>                              
                <td><?php echo $product["name"] ?></td>
                <td><?php echo $product["price"] ?></td>
                <td><?php echo $product["vat"] ?></td>
                <td><?php echo "<a href = \" /detail/$product[id]\">detail produktu</a>" ?></td>
                <td><?php echo $product["quantity"] ?></td>       
                <td><?php include('../forms/cartItemUpdateForm.php')?></td>
                <td><?php include('../forms/cartItemDeleteForm.php')?></td>
            </tr>    
        <?php } //endforeach ?>

        </tr>        
    </thead>
</table>

