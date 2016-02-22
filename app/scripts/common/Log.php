<?php 

Class Log { 

  /* 
   Log chyb
  */ 
    public function log($msg) 
    { 
    $date = date('d.m.Y H:i:s'); 
    $log =   "Date:  ".$date ." | " .$msg ."\n"; 
    error_log($log, 3, CONFIG_LOG_FILE); 
    } 
}