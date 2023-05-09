<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        
<?php
    // Base-URL ermittlen
    $baseUrl = '';
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTPS', FILTER_VALIDATE_BOOLEAN) ? "https://" : "http://";
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTP_HOST');
    
    $themeUrl .= $baseUrl . '/kijs/css/kijs.theme.default.css';
    // CSS Files
?>
    <link rel="stylesheet" type="text/css" href="<?=$themeUrl?>">
<?php
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui&fileType=css');

    // JS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui&fileType=js');
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
