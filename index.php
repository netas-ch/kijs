<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <link rel="stylesheet" type="text/css" href="css/style.css">
        <link rel="shortcut icon" href="./favicon.ico">
<?php
    // Base-URL ermittlen
    $baseUrl = '';
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTPS', FILTER_VALIDATE_BOOLEAN) ? "https://" : "http://";
    $baseUrl .= filter_input(INPUT_SERVER, 'HTTP_HOST');

    // CSS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,editor&fileType=css');

    // JS Files
    echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,editor&fileType=js');
?>

        <script type="text/javascript" src="tests/kijs.Test.js"></script>

        <script type="text/javascript" src="tests/test_01_class.js"></script>
        <script type="text/javascript" src="tests/test_02_multiLevelInheritance.js"></script>
        <script type="text/javascript" src="tests/test_03_singleton.js"></script>
        <script type="text/javascript" src="tests/test_04_event.js"></script>
        <script type="text/javascript" src="tests/test_05_ajax.js"></script>
        <script type="text/javascript" src="tests/test_06_rpc.js"></script>
        <script type="text/javascript" src="tests/test_07_date.js"></script>
        <script type="text/javascript" src="tests/test_08_nodeEvents.js"></script>
        <script type="text/javascript" src="tests/test_09_Storage.js"></script>

        <script type="text/javascript" src="tests/gui/gui_test_01_element.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_02_container.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_03_icon.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_04_button.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_05_panelBar.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_06_panel.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_07_window.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_08_listView.js"></script>
        <script type="text/javascript" src="tests/gui/gui_test_09_calendar.js"></script>


        <script>
            function toggleTodosVisibility() {
                var stl=document.getElementById("todoInner").style;
                stl.display = !stl.display||stl.display=='none' ? 'block' : 'none';
            }
        </script>
        <title>kijs Library</title>
    </head>
    <body>
        <section id="content">
            <h1>Tests</h1>
            <p><a href="javascript:test_01_class();">1 Klassen</a></p>
            <p><a href="javascript:test_02_multiLevelInheritance();">2 mehrstufige Vererbung</a></p>
            <p><a href="javascript:test_03_singleton();">3 Klasse vom Typ singleton</a></p>
            <p><a href="javascript:test_04_event();">4 Events</a></p>
            <p><a href="javascript:test_05_ajax();">5 Ajax</a></p>
            <p><a href="javascript:test_06_rpc();">6 RPC</a></p>
            <p><a href="javascript:test_07_date();">7 Datum</a></p>
            <p><a href="javascript:test_08_nodeEvents();">8 Node-Events</a></p>
            <p><a href="javascript:test_09_storage();">9 Storage</a></p>
            <p>&nbsp;</p>
            <h2>GUI</h2>
            <p><a href="javascript:gui_test_01_element();">01 Element</a></p>
            <p><a href="javascript:gui_test_02_container();">02 Container</a></p>
            <p><a href="javascript:gui_test_03_icon();">03 Icon</a></p>
            <p><a href="javascript:gui_test_04_button();">04 Button</a></p>
            <p><a href="javascript:gui_test_05_panelBar();">05 PanelBar</a></p>
            <p><a href="javascript:gui_test_06_panel();">06 Panel</a></p>
            <p><a href="javascript:gui_test_07_window();">07 Window</a></p>
            <p><a href="javascript:gui_test_08_listView();">08 ListView</a></p>
            <p><a href="javascript:gui_test_09_calendar();">09 Calendar</a></p>
            <p>&nbsp;</p>
            <p><a href="testViewPort/test_afterResize.php">ViewPort afterResize Events</a></p>
            <p><a href="testApp">Test-App</a></p>
            <p><a href="showcase">Showcase</a></p>
            <section id="todo" onclick="toggleTodosVisibility();">
                <h1>To-Do</h1>
                <section id="todoInner">
                    <h2>Klassen</h2>
                    <p>X regular</p>
                    <p>X singleton</p>

                    <h2>Klassen erweitert</h2>
                    <p>X Events</p>
                    <p>X Destructor</p>

                    <h2>Weiteres</h2>
                    <p>X Ajax</p>
                    <p>X RPC</p>
                    <p>X DOM-Events</p>
                    <p>X Config-Argumente</p>
                    <p>X JSON definition von Formularen (xtype)</p>
                    <p>X Hilfsfunktionen z.B. für DOM-Operationen</p>

                    <h2>GUI Basiselemente</h2>
                    <p>X gui.Element</p>
                    <p>X gui.BoxElement</p>
                    <p>X gui.Container</p>
                    <p>X gui.ViewPort</p>
                    <p>X gui.Icon</p>
                    <p>X gui.PanelBar</p>
                    <p>X gui.Resizer</p>
                    <p>X gui.Panel</p>
                    <p>X gui.Window</p>

                    <h2>GUI Elemente</h2>
                    <p>X gui.Button</p>
                    <p>O gui.Tabs</p>
                    <p>O gui.Accordeon</p>
                    <p>O gui.Navi</p>
                    <p>O gui.Tree</p>
                    <p>O gui.DataView</p>
                    <p>O gui.Grid</p>

                    <h2>Fields</h2>
                    <p>X gui.field.Field</p>
                    <p>X gui.field.Label</p>
                    <p>X gui.field.Text</p>
                    <p>X gui.field.Memo</p>
                    <p>X gui.field.Number</p>
                    <p>X gui.field.YesNo</p>
                    <p>O gui.field.Combo</p>
                    <p>X gui.field.Multiselect</p>

                    <h2>Phase 3</h2>
                    <p>O App Builder (PHP)</p>
                </section>
            </section>
        </section>
    </body>
</html>
