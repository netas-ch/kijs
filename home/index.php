<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1" />
    <link rel="shortcut icon" href="../favicon.ico">
    <style>
        @layer kijs, kijs-theme, app;
    </style>
<?php
    // Base-URL ermittlen
    $baseUrl = '';
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTPS', FILTER_VALIDATE_BOOLEAN) ? "https://" : "http://";
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTP_HOST');

    $themeUrl = $baseUrl . '/kijs/css/kijs.theme.default.css?v=' . filemtime('../css/kijs.theme.default.css');
    // CSS Files
?>
    <link rel="stylesheet" type="text/css" href="<?=$themeUrl?>">
<?php
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor,quillEditor&fileType=css');
?>
    <link rel="stylesheet" type="text/css" href="app/style.css?v=<?=filemtime('app/style.css')?>">
    <link rel="stylesheet" type="text/css" href="dataResources/css/style.css?v=<?=filemtime('dataResources/css/style.css')?>">
<?php
    // JS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,translations,gui,grid,aceEditor,quillEditor&fileType=js');
?>
    <script type="text/javascript" src="app/marked.min.js?v=<?=filemtime('app/marked.min.js')?>"></script>
    <script type="text/javascript" src="app/home.TabContainer.js?v=<?=filemtime('app/home.TabContainer.js')?>"></script>
    <script type="text/javascript" src="app/home.App.js?v=<?=filemtime('app/home.App.js')?>"></script>
    <script type="text/javascript">
        kijs.isReady(function(){
            let app = new home.App({
                appAjaxUrl: 'app/ajax.php',
                dataAjaxUrl: 'dataResources/php/ajax.php',
                language: kijs.Navigator.getGetParameter('lang')
            });
            app.run();
        });
    </script>

    <title>kijs - Home</title>
</head>

<body>
</body>

</html>
