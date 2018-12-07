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
print($compiled);