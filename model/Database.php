<?php

/**
 * Description of database
 * Database model pro controlery
 *
 * @author vizus.jestrab
 */

class Database
{  
    private $host;
    private $user;
    private $pass;
    private $dbname;
 
    private $db;
    private $stmt;
    private $error;
 
    public function __construct()
    {
        require_once '../scripts/common/config.php';
        
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
$customer = $db->insertRow("product", $array);
var_dump($customer);*/


