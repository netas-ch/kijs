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
    
    // CSS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor,quillEditor&fileType=css');
?>    
    <link rel="stylesheet" type="text/css" href="app/style.css">
    <link rel="stylesheet" type="text/css" href="dataResources/css/style.css">
<?php
    // JS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor,quillEditor&fileType=js');
?>
    <script type="text/javascript" src="app/marked.min.js"></script>
    <script type="text/javascript" src="app/home.App.js"></script>
    <script type="text/javascript">
        kijs.isReady(function(){
            let app = new home.App({
                appAjaxUrl: 'app/ajax.php',
                dataAjaxUrl: 'dataResources/php/ajax.php'
            });
            app.run();
        });
    </script>

    <title>kijs - Home</title>
</head>

<body>
</body>

</html>
