<?php
/**
 * configures general layout
 * for detailed layout configuration please refer to the css files
 */

/**
 * navi frame
 */
$GLOBALS['cfg']['NaviWidth']                = 250;
$GLOBALS['cfg']['NaviColor']                = '#000000';
$GLOBALS['cfg']['NaviBackground']           = '#E0E0E0';
$GLOBALS['cfg']['NaviPointerColor']         = '#C00000';
$GLOBALS['cfg']['NaviPointerBackground']    = '';

/**
 * main frame
 */
$GLOBALS['cfg']['MainColor']                = '#000000';
$GLOBALS['cfg']['MainBackground']           = '#F5F5F5';
$GLOBALS['cfg']['BrowsePointerColor']       = '#000000';
$GLOBALS['cfg']['BrowsePointerBackground']  = '#FFFFC0';
$GLOBALS['cfg']['BrowseMarkerColor']        = '#000000';
$GLOBALS['cfg']['BrowseMarkerBackground']   = '#FFCC99';

$GLOBALS['cfg']['FontFamily']           = 'tahoma, sans-serif';
$GLOBALS['cfg']['FontFamilyFixed']      = 'monospace';

/**
 * tables
 */
// border
$GLOBALS['cfg']['Border']               = 0;
$GLOBALS['cfg']['ThBackground']         = '#D3DCE3';
$GLOBALS['cfg']['ThColor']              = '#000000';
$GLOBALS['cfg']['BgOne']                = '#E5E5E5';
$GLOBALS['cfg']['BgTwo']                = '#D5D5D5';

/**
 * query window
 */
// Width of Query window
$GLOBALS['cfg']['QueryWindowWidth']     = 600;
// Height of Query window
$GLOBALS['cfg']['QueryWindowHeight']    = 400;

/**
 * SQL Parser Settings
 * Syntax colouring data
 */
$GLOBALS['cfg']['SQP']['fmtColor']      = array(
    'comment'            => '#808000',
    'comment_mysql'      => '',
    'comment_ansi'       => '',
    'comment_c'          => '',
    'digit'              => '',
    'digit_hex'          => 'teal',
    'digit_integer'      => 'teal',
    'digit_float'        => 'aqua',
    'punct'              => 'fuchsia',
    'alpha'              => '',
    'alpha_columnType'   => '#FF9900',
    'alpha_columnAttrib' => '#0000FF',
    'alpha_reservedWord' => '#990099',
    'alpha_functionName' => '#FF0000',
    'alpha_identifier'   => 'black',
    'alpha_charset'      => '#6495ed',
    'alpha_variable'     => '#800000',
    'quote'              => '#008000',
    'quote_double'       => '',
    'quote_single'       => '',
    'quote_backtick'     => ''
);
?>
