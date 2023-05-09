<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <link rel="shortcut icon" href="../favicon.ico">
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
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor&fileType=css');

    // JS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor&fileType=js');
?>
        <script type="text/javascript" src="js/kit.App.js"></script>

        <style>
            .icoKijs16 {
                background-image: url('../favicon.ico');
                background-size: 16px;
                height: 16px;
                width: 16px;
            }
            .icoWizard16 {
                background-image: url('img/icoWizard16.png');
                height: 16px;
                width: 16px;
            }
            .icoFolder32 {
                background-image: url('img/icoFolder32.png');
                height: 32px;
                width: 32px;
            }
            .icoFolderOpen32 {
                background-image: url('img/icoFolderOpen32.png');
                height: 32px;
                width: 32px;
            }
        </style>
        <script type="text/javascript">
            kijs.isReady(function(){
                var app = new kit.App({
                    ajaxUrl: 'ajax.php'
                });
                app.run();
            });
        </script>

        <title>kijs</title>
    </head>
    <body>
    </body>
</html>
