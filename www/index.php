<!DOCTYPE html>

<html>
    <head>
        <title> Vizus E-shop</title>
        
        <meta charset="UTF-8">
        <meta http-equiv="content-type" content="text/html;charset=utf-8">
        <meta http-equiv="Content-language" content="cs">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Testovací zadání Vizus eshop"/>
        <meta name="keywords" content=",Vizus, eshop"/>
        <meta name="author" content="Josef Jakub Jestřáb"/>
        <meta name="copyright" content="(c) 2016 VIZUS.CZ s.r.o."
        <meta name="Robots" content="all"/>
        
        <script type="text/javascript" src="js/core.js"></script>
    </head>
    <body>
        <div id = header>
            <h1 class = "nor">Vizus E-shop</h1><br />
            <?php 
                @session_start();
                
                if((isset($_SESSION["info"])) && (!empty($_SESSION["info"]))){ ?>                 
                    <div id = "info"><p><?php echo $_SESSION["info"]; ?></p></div>
                <?php } 
                
                if(isset($_SESSION["info"])){ $_SESSION["info"] = null;}
                
                if (!isset($_SESSION["csrf_token"])) {
                    $_SESSION["csrf_token"] = rand(1, 1e9);
                }
                
                $detail_id = filter_input(INPUT_GET, 'detail_id');
                $cart_detail = filter_input(INPUT_GET, 'cart_detail');
                
            ?>            
        </div>            
            <div class = "w100" id = "main">
                <div id = "content">
                    <div class = "fright"><a href = "kosik/" title ="přejít do košíku">Košík</a></div>
                    
                    <?php 
                    if(isset($detail_id))
                        include('../view/detail.php');
                    elseif (isset($cart_detail)) 
                        include('../view/cart.php');  
                    else 
                        include('../view/list.php');                    
                    ?>
                    
                </div>    
            </div>
            <p class = "p10"><a href="http://www.vizus.cz/" title="VIZUS – tvorba www stránek">VIZUS</a> | <a href="http://www.vizus.cz/webmaster/">webmaster</a> | Zde zatím nepoužíváme <a href="http://www.vizus.cz/produkty/cms/" title="Redakční systém Vizus CMS">redakční systém Vizus CMS</a></p>
    </body>
</html>