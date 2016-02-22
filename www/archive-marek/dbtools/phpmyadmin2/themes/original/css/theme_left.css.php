<?php
// unplanned execution path
if (!defined('PMA_MINIMUM_COMMON')) {
    exit();
}
?>
/******************************************************************************/
/* general tags */

body {
<?php if (! empty($GLOBALS['cfg']['FontFamily'])) { ?>
    font-family:        <?php echo $GLOBALS['cfg']['FontFamily']; ?>;
<?php } ?>
    background:         <?php echo $GLOBALS['cfg']['NaviBackground']; ?>;
    color:              <?php echo $GLOBALS['cfg']['NaviColor']; ?>;
    margin:             0;
    padding:            0.2em 0.2em 0.2em 0.2em;
    font-size: 80%;
}

a img {
    border: 0;
}

form {
    margin:             0;
    padding:            0;
    display:            inline;
}

select {
    width:              100%;
}

/* buttons in some browsers (eg. Konqueror) are block elements,
   this breaks design */
button {
    display:            inline;
}


/******************************************************************************/
/* classes */

/* leave some space between icons and text */
.icon {
    vertical-align:     middle;
    margin-right:       0.1em;
    margin-left:        0.1em;
}


/******************************************************************************/
/* specific elements */

div#leftframelinks
{
	float: right;
}
div#pmalogo,
div#databaseList {
    text-align:         left;
    background-color:   #C0C0C0;
    margin-bottom:      5px;
    padding:            5px;
}

ul#databaseList {
    border-bottom:      0.05em solid <?php echo $GLOBALS['cfg']['NaviColor']; ?>;
    margin-bottom:      0.5em;
    padding-bottom:     0.5em;
    padding-left: 	1.5em;
}

ul#databaseList a {
    display: block;
    background:         <?php echo $GLOBALS['cfg']['NaviBackground']; ?>;
    color:              <?php echo $GLOBALS['cfg']['NaviColor']; ?>;
}

ul#databaseList a:hover {
    background:         <?php echo $GLOBALS['cfg']['NaviPointerBackground']; ?>;
    color:              <?php echo $GLOBALS['cfg']['NaviPointerColor']; ?>;
}

ul#databaseList li.selected a {
    background: <?php echo $GLOBALS['cfg']['BrowseMarkerBackground']; ?>;
    color: <?php echo $GLOBALS['cfg']['BrowseMarkerColor']; ?>;
}


/* serverlist */
#body_leftFrame #list_server {
    list-style-image: url(../<?php echo $GLOBALS['cfg']['ThemePath']; ?>/original/img/s_host.png);
    list-style-position: inside;
    list-style-type: none;
    margin: 0;
    padding: 0;
}

#body_leftFrame #list_server li {
    margin: 0;
    padding: 0;
    font-size:          100%;
}

/* leftdatabaselist */
div#left_tableList ul {
    list-style-type:    none;
    list-style-position: outside;
    margin:             0;
    padding:            0;
    font-size:          100%;
    background:         <?php echo $GLOBALS['cfg']['NaviBackground']; ?>;
}

div#left_tableList ul ul {
}

div#left_tableList a {
    background:         <?php echo $GLOBALS['cfg']['NaviBackground']; ?>;
    color:              #000000;
    text-decoration:    none;
}

div#left_tableList a:hover {
    background:         <?php echo $GLOBALS['cfg']['NaviBackground']; ?>;
    color:              #E00000;
    text-decoration:    underline;
}

div#left_tableList li {
    font-family:			verdana, tahoma;
    font-size:				8pt;
    margin:             0;
    margin-bottom: 3px;
    _margin-bottom: 0px;
    padding:            0;
    white-space:        nowrap;
}

div#left_tableList
{
   font-family:			verdana, tahoma;
	padding: 5px;
}
<?php if ($GLOBALS['cfg']['BrowseMarkerColor']) { ?>
/* marked items */
div#left_tableList > ul li.marked > a,
div#left_tableList > ul li.marked {
    background: <?php echo $GLOBALS['cfg']['BrowseMarkerBackground']; ?>;
    color: <?php echo $GLOBALS['cfg']['BrowseMarkerColor']; ?>;
}
<?php } ?>

<?php if ( $GLOBALS['cfg']['LeftPointerEnable'] ) { ?>
div#left_tableList > ul li:hover > a,
div#left_tableList > ul li:hover {
    background:         <?php echo $GLOBALS['cfg']['NaviPointerBackground']; ?>;
    color:              <?php echo $GLOBALS['cfg']['NaviPointerColor']; ?>;
}
<?php } ?>

div#left_tableList img {
    padding:            0;
    vertical-align:     middle;
    position: relative;
    top: 1px;
}

div#left_tableList ul ul {
    margin-left:        0;
    padding-left:       0.1em;
    border-left:        0.1em solid <?php echo $GLOBALS['cfg']['NaviColor']; ?>;
    padding-bottom:     0.1em;
    border-bottom:      0.1em solid <?php echo $GLOBALS['cfg']['NaviColor']; ?>;
}
