<?php

/**
 * Database model pro controlery
 *
 * @author vizus.jestrab
 */

class DatabaseModel
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
    
    public static function getInstance()
    {
      if(self::$instance === false){
        self::$instance = new DatabaseModel;
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
            
            var_dump($this->stmt->queryString,$this->error, $pdo_array);exit;
            return false;
        }
    }
    
    
    /**
    *  metoda pro zjisteni poctu radku
    * @param    string   $table nazev tabulky
    * @param    array   $params
    * @return   int
    */
    public function getCount($table, $params = null)
    {
        try{
            $select = "SELECT * FROM `{$table}`";
            if(isset($params['active'])){
                $select .= "where is_active = " .$params['active'];
            }
            $this->stmt = $this->db->prepare($select);
            $this->stmt->execute();
            $count = $this->stmt->rowCount();
            return $count;
        } 
        
        catch (PDOException $e)
        {
            $this->error = $e->getMessage(); 
            return false;
        }
    }
    
   /**
    *  metoda pro hledani konkretniho uzivatele
    * @param    string   $table nazev tabulky
    * @param    id   $id
    * @return   $array
    */
    public function getUser($username)
    {
        try{
            $this->stmt = $this->db->prepare("SELECT * FROM `user` WHERE username = :username AND is_active=1");
            $this->stmt->execute(array(":username"=>$username));
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
    public function getAll($table,$limit = null,$offset = null,$params = null)
    {
            
        try{
            $select = "SELECT * FROM `{$table}`";
            
            if(isset($params['active'])){
                $select .= " where is_active = " .$params['active'];
            }
            
            if(!isset($params['order_direction']))
            {
                $params['order_direction'] = 'ASC';
            }
        
            if(isset($params['order_by']))
            {
                $select .= " order by " .$params['order_by'] ." " .$params['order_direction'];
            }
            
            if(isset($limit))
            {
                $select .= " limit " .$offset ."," .$limit;    
            }
            
            $this->stmt = $this->db->prepare($select);
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
    * metoda pro vlozeni obsahu do tabulky
    * @param    string   $table nazev tabulky
    * @param    array   $array asociativni pole pro pridani hodnot
    * @return   boolean
    */
    public function insertRow($table, $array)
    {
        try{
            $this->stmt = $this->db->prepare("INSERT INTO `{$table}` (`".implode('`, `',array_keys($array)).'`) VALUES (:' . implode(', :', array_keys($array)) . ')');
            
            foreach ($array as $key => $value) {
                $new_key = ":".$key;
                $pdo_array[$new_key] = $value;
            }
            
            $this->stmt->execute($pdo_array);
            
            return true;
        } 
        
        catch (PDOException $e)
        {
            
            $this->error = $e->getMessage();
            new Log($this->stmt->queryString,$this->error, $pdo_array);
            return false;
        }
    }
    
    /**
    * metoda pro zmenu radku tabulky
    * @param    string   $table nazev tabulky
    * @param    array   $array asociativni pole pro pridani hodnot
    * @param    int   $id id radku
    * @return   boolean
    */
    public function updateRow($table, $array, $id)
    {
        $select = "";
        foreach ($array as $key => $value) 
        {
            $select .= $key ." = :$key,";
        }
        $select = rtrim($select, ",");
        
        try{
            $this->stmt = $this->db->prepare("UPDATE `{$table}` SET " .$select ." WHERE id=:id");
            
            foreach ($array as $key => $value) {
                $new_key = ":".$key;
                $pdo_array[$new_key] = $value;
            }
            $pdo_array[':id'] = $id; 
            
            $this->stmt->execute($pdo_array);
            
            return true;
        } 
        
        catch (PDOException $e)
        {
            
            $this->error = $e->getMessage();
            new Log($this->stmt->queryString,$this->error, $pdo_array);
            return false;
        }
    }
    
    /**
    * metoda pro smazani radku tabulky
    * @param    string   $table nazev tabulky
    * @param    int   $id id radku
    * @return   boolean
    */
    public function deleteRow($table, $id)
    {
        try{
            $this->stmt = $this->db->prepare("DELETE FROM `{$table}`  WHERE id=:id");            
            $this->stmt->execute(array(":id"=>$id));           
            return true;
        } 
        
        catch (PDOException $e)
        {
            
            $this->error = $e->getMessage();
            new Log($this->stmt->queryString,$this->error, $pdo_array);
            return false;
        }
    }
    
    /**
    *  metoda pro zamknuti tabulky
    */
    public function lockTable($table)
    {
        try{
            $this->stmt = $this->db->prepare("LOCK TABLES `{$table}`");
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
    *  metoda pro zamknuti tabulky
    */
    public function unlockTable($table)
    {
        try{
            $this->stmt = $this->db->prepare("UNLOCK TABLES `{$table}`");
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



/*$db = new DatabaseModel;
$array = ["name"=>"sada snadno a rychle",
            "description"=>"univerzální sada na opravu čehokoliv, osvědčená miliony lidí, levná a univerzální, výhodné balení po 5 kusech",
            "price"=>54.9,
            "vat"=>19,
            "image_file"=>"ductape.jpg",
            "active"=>1,
            "mount"=>"5 ks"];
$insert = $db->insertRow("product", $array);
var_dump($insert);*/


