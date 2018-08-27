<?php
require '../lib/lessphp/lessc.inc.php';
$less = new lessc;

header('Content-Type: text/css');
echo $less->compileFile("kijs.gui.less");