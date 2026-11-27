<?php
declare(strict_types=1);

// Testseite: nur lokal ausführbar
require_once '../tools/localOnly.php';

require_once '../tools/getDebugHead.php';

$themeUrl = '../css/kijs.theme.default.css';
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        
<?php
    // CSS Files
?>
    <link rel="stylesheet" type="text/css" href="<?=$themeUrl?>">
<?php
    echo kijs_getDebugHead(['core', 'gui'], 'css', '../');

    // JS Files
    echo kijs_getDebugHead(['core', 'gui'], 'js', '../');
?>   

        <script type="text/javascript" src="js/test_afterResize.js"></script>

        <script type="text/javascript">
            kijs.isReady(function(){
                var app = new kit.App({
                    ajaxUrl: 'ajax.php'
                });
                app.run();
            });
        </script>
    
        <title>kijs Viewport Test afterResize-Events</title>
    </head>
    <body>
    </body>
</html>
