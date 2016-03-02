<?php


/**
 * Resi strankovani
 *
 * @author vizus.jestrab
 */
class Pagination {
    
    /** @var Database instance. */
    protected static $db;  
    protected $source;
    public $limit;   
    public $page;
    public $total;

    public function __construct()
    {
        self::$db = \DatabaseModel::getInstance();
    }
    
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
