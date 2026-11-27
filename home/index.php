<?php
declare(strict_types=1);

require_once '../tools/getDebugHead.php';

$themeUrl = '../css/kijs.theme.default.css?v=' . filemtime('../css/kijs.theme.default.css');
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1" />
    <link rel="icon" href="../favicon.svg?v=<?=filemtime('../favicon.svg')?>" type="image/svg+xml">
    <link rel="icon" href="../favicon.ico?v=<?=filemtime('../favicon.ico')?>" sizes="16x16 32x32 48x48">
    <link rel="apple-touch-icon" href="../apple-touch-icon.png?v=<?=filemtime('../apple-touch-icon.png')?>">
    <style>
        @layer kijs, kijs-theme, app;
    </style>
<?php
    // CSS Files
?>
    <link rel="stylesheet" type="text/css" href="<?=$themeUrl?>">
<?php
    echo kijs_getDebugHead(['core', 'gui', 'grid', 'aceEditor', 'quillEditor'], 'css', '../');
?>
    <link rel="stylesheet" type="text/css" href="app/style.css?v=<?=filemtime('app/style.css')?>">
    <link rel="stylesheet" type="text/css" href="dataResources/css/style.css?v=<?=filemtime('dataResources/css/style.css')?>">
    <script type="text/javascript" src="../lib/ace/src-min-noconflict/ace.js"></script>
    <script type="text/javascript" src="../lib/quill/quill.js"></script>
<?php
    // JS Files
    echo kijs_getDebugHead(['core', 'translations', 'gui', 'grid', 'aceEditor', 'quillEditor'], 'js', '../');
?>
    <script type="text/javascript" src="app/marked.min.js?v=<?=filemtime('app/marked.min.js')?>"></script>
    <script type="text/javascript" src="app/home.TabContainer.js?v=<?=filemtime('app/home.TabContainer.js')?>"></script>
    <script type="text/javascript" src="app/home.ApiClassPage.js?v=<?=filemtime('app/home.ApiClassPage.js')?>"></script>
    <script type="text/javascript" src="app/home.ApiIssuesPage.js?v=<?=filemtime('app/home.ApiIssuesPage.js')?>"></script>
    <script type="text/javascript" src="app/home.ApiSourcePage.js?v=<?=filemtime('app/home.ApiSourcePage.js')?>"></script>
    <script type="text/javascript" src="app/home.ApiUpdate.js?v=<?=filemtime('app/home.ApiUpdate.js')?>"></script>
    <script type="text/javascript" src="app/home.SearchPage.js?v=<?=filemtime('app/home.SearchPage.js')?>"></script>
    <script type="text/javascript" src="app/home.ToolsPage.js?v=<?=filemtime('app/home.ToolsPage.js')?>"></script>
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
