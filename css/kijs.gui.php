<?php
require '../lib/lessphp/lessc.inc.php';
$less = new lessc;

$compiled = $less->compileFile("kijs.gui.less");

$compiled =  "
/* **********************************
   *         compiled file          *
   *      --- Do not edit ---       *
   ********************************** */
" . $compiled;

file_put_contents('kijs.gui.css', $compiled);

header('Content-Type: text/css');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Expires: Wed, 21 Oct 2015 01:00:00 GMT');
header('Pragma: no-cache');
print($compiled);