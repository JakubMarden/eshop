<?php
$products = $db->getAllActive("product");
?>  
<div class = "fright"><a href = "kosik/" title ="přejít do košíku">Košík</a></div>
<h2>Produkt list</h2>
<table>
    <thead>
        <tr>
            <th>název produktu</th>
            <th>cena</th>
            <th>množství</th>
            <th>detail produktu</th>
            <th>do košíku</th>
        </tr>

        <?php
        foreach($products as $product){?>
            <tr>                              
                <td><?php echo $product["name"] ?></td>
                <td><?php echo $product["price"] ?></td>
                <td><?php echo $product["mount"] ?></td>
                <td><?php echo "<a href = \" /detail/$product[id]\">detail produktu</a>" ?></td>
                <td>    
                    <?php include('../forms/cartItemUpdateForm.php')?>
                </td>
            </tr>    
        <?php } //endforeach ?>

        </tr>        
    </thead>
</table>

