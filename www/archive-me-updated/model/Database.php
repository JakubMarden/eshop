<?php

/**
 * Database model pro controlery
 *
 * @author vizus.jestrab
 */

class Database
{  
    /** @var string host pripojeni. */
    private $host;
    
    /** @var string uzivatelske jmeno pro  pripojeni k databazi. */
    private $user;
    
    /** @var string uzivatelske heslo pro  pripojeni k databazi. */
    private $pass;
    
    /** @var string nazev databaze. */
    private $dbname;
 
    /** @var Database pripojeni. */
    private $db;
    
    /** @var Database instance. */
    private static $instance = false;
    
    /** @var pomocna promenna pro pripojeni k datum */
    private $stmt;
    
    /** @var exception chybova hlaska v pripade neuspechu. */
    private $error;
    
 
    public function __construct()
    {
        $this->host      = CONFIG_HOST;
        $this->user      = CONFIG_USER;
        $this->pass      = CONFIG_PASSWORD;
        $this->dbname    = CONFIG_DBNAME;
        
        $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->dbname;
        $options = array(
            PDO::ATTR_PERSISTENT    => true,
            PDO::ATTR_ERRMODE       => PDO::ERRMODE_EXCEPTION
        );

        try{
            $this->db = new PDO($dsn, $this->user, $this->pass, $options);
        }

        catch(PDOException $e){
            $this->error = $e->getMessage();
        }
    }
    
    public static function __getInstance()
    {
      if(self::$instance === false){
        self::$instance = new Database;
      }
      return self::$instance;
    }
    
    
    /**
    *  metoda pro reseni obecnych dotazu, na ktere se nehodi dalsi metody
    * @param    string   $query
    * @return   $array
    */
    public function query($query)
    {
        try{
            $this->stmt = $this->db->prepare($query);
            $this->stmt->execute();
            return $result = $this->stmt->fetchAll(PDO::FETCH_ASSOC);
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage(); 
            return false;
        }
    }
    
    /**
    *  metoda pro hledani konkretnich radku podle id
    * @param    string   $table nazev tabulky
    * @param    id   $id
    * @return   $array
    */
    public function getRowByID($table, $id)
    {
        try{
            $this->stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE id=:id");
            $this->stmt->execute(array(":id"=>$id));
            return $result = $this->stmt->fetch(PDO::FETCH_ASSOC);
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage(); 
            return false;
        }
    }
    
    /**
    *  metoda pro vraceni cele tabulky
    * @param    string   $table nazev tabulky
    * @return   $array
    */
    public function getAllActive($table)
    {
        try{
            $this->stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE active=:active");
            $this->stmt->execute(array(":active"=>1));
            return $result = $this->stmt->fetchAll(PDO::FETCH_ASSOC);
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage(); 
            return false;
        }
    }
    
    /**
    *  metoda pro vraceni nejvyssiho idcka
    * @param    string   $table nazev tabulky
    * @return   int
    */
    public function getMaxId($table)
    {
        try{
            $this->stmt = $this->db->prepare("SELECT MAX(id) FROM `{$table}`");
            $this->stmt->execute();
            $result = $this->stmt->fetch(PDO::FETCH_ASSOC);
            if(empty($result['MAX(id)'])){
                $result = 0;
            }
            return $result['MAX(id)'];
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage(); 
            return false;
        }
    }
    
    /**
    *  metoda pro vlozeni obshu do tabulky
    * @param    string   $table nazev tabulky
    * @param    array   $array asociativni pole pro pridani hodnot
    * @return   boolean
    */
    public function insertRow($table, $array)
    {
        try{
            $this->stmt = $this->db->prepare("INSERT INTO `{$table}` (`".implode('`, `',array_keys($array)).'`) VALUES ("' . implode('", "', $array) . '")');
            $this->stmt->execute();
            
            return true;
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage();
            return false;
        }
    }
    
    /**
    *  metoda pro ukonceni relace
    */
    public function CloseConnection()
    {
        $this->db = null;
    }    
}



/*$db = new Database;
$array = ["name"=>"sada snadno a rychle",
            "description"=>"univerzální sada na opravu čehokoliv, osvědčená miliony lidí, levná a univerzální, výhodné balení po 5 kusech",
            "price"=>54.9,
            "vat"=>19,
            "image_file"=>"ductape.jpg",
            "active"=>1,
            "mount"=>"5 ks"];
$insert = $db->insertRow("product", $array);
var_dump($insert);*/


