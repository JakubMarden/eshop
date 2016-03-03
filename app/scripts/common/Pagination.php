<?php


/**
 * Trida pro strankovani obsahu
 *
 * @author vizus.jestrab
 */
class Pagination {
    
    /** @var Database instance. */
    protected static $db;  
    
    /** @var string Nastavuje z jake tabulky se budou tahat strankvana data. */
    protected $source;
    
    /** @var int Nastavuje po kolika radcich se bude obsah delit. */
    public $limit;   
    
    /** @var string Obsahuje informaci, na jake strance aktualne je. */
    public $page;
    
    /** @var string udrzuje informaci o celkovem poctu dat k zobrazeni bez ohledu na limit. */
    public $total;

    public function __construct()
    {
        self::$db = \DatabaseModel::getInstance();
    }
    
    /**
    * metoda pro ziskani strankovanych dat
    * @param    string   $source nastavuje z jake tabulky se budou tahat strankvana data
    * @param    int   $limit nastavuje po kolika radcich se bude obsah delit
    * @param    array  $params
    * @return   $array
    */
    public function getData($source, $limit, $params = null)
    {
        $this->limit   = intval($limit);
        $this->source  = $source;
        $this->page = 1;
        $offset = 0;
        
        if(isset($params['page']))
            $this->page  = intval($params['page']);
        
        
        if(isset($params['active']))
        {
            intval($params['active']);
        }
        
        $this->total = self::$db->getCount($source, $params);
        
        if($this->limit > 0 and $this->page > 0)
        {
            $offset = $this->limit * ($this->page -1);   
        }
        elseif(!$this->limit > 0)
        {
            $this->limit = $this->total;    
        }
        
        return $data = self::$db->getAll($this->source,$this->limit,$offset,$params);          
    }
}
