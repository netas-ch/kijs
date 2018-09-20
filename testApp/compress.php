<?php

$files = array(
        // JavaScript
        '../js/murgs/IE11.js',
    
        '../js/kijs.js',
        '../js/kijs.String.js',
        '../js/kijs.Array.js',
        '../js/kijs.Object.js',
        '../js/kijs.Date.js',
        '../js/kijs.Dom.js',
        '../js/kijs.Grafic.js',
        
        '../js/kijs.Observable.js',
        
        '../js/kijs.Ajax.js',
        '../js/kijs.Rpc.js',
        
        '../js/gui/kijs.gui.js',
        '../js/gui/kijs.gui.Dom.js',
        '../js/gui/kijs.gui.ToolTip.js',
        '../js/gui/kijs.gui.Element.js',
        '../js/gui/kijs.gui.Container.js',
        '../js/gui/kijs.gui.SpinBox.js',
        '../js/gui/kijs.gui.ViewPort.js',
        
        '../js/gui/kijs.gui.Icon.js',
        '../js/gui/kijs.gui.Button.js',
        '../js/gui/kijs.gui.ButtonGroup.js',
        
        '../js/gui/kijs.gui.HeaderBar.js',
        '../js/gui/kijs.gui.FooterBar.js',
        '../js/gui/kijs.gui.Resizer.js',
        '../js/gui/kijs.gui.Splitter.js',
        '../js/gui/kijs.gui.Panel.js',

        '../js/gui/kijs.gui.Mask.js',
        '../js/gui/kijs.gui.LayerManager.js',
        '../js/gui/kijs.gui.Window.js',
        '../js/gui/kijs.gui.MsgBox.js',
        
        '../js/gui/kijs.gui.CornerTipContainer.js',

        '../js/gui/kijs.gui.Rpc.js',
        '../js/gui/kijs.gui.DataViewElement.js',
        '../js/gui/kijs.gui.DataView.js',
        '../js/gui/kijs.gui.FormPanel.js',
        
        '../js/gui/field/kijs.gui.field.js',
        '../js/gui/field/kijs.gui.field.Field.js',
        '../js/gui/field/kijs.gui.field.Text.js',
        '../js/gui/field/kijs.gui.field.Memo.js',
        '../js/gui/field/kijs.gui.field.Password.js',
        '../js/gui/field/kijs.gui.field.Checkbox.js',
        '../js/gui/field/kijs.gui.field.CheckboxGroup.js',
        '../js/gui/field/kijs.gui.field.OptionGroup.js',
        '../js/gui/field/kijs.gui.field.Combo.js',
        
        'js/kit.App.js',
    
        // CSS
        '../css/kijs.gui.less'
    );

    
    $js = '';
    $css = '';
    
    foreach($files as $file) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        switch ($extension) {
            case 'js':
                $js .= file_get_contents($file) . "\n";
                break;
            
            case 'css':
            case 'less':
                $css .= file_get_contents($file) . "\n";
                break;

            default:
                throw new Exception('Ungültiges Dateiformat: ' . $extension);
        }
    }
    
echo('
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="icon" type="image/png" href="favicon.png">
    <style>
        textarea { width: 100%; height: 350px; }
    </style>
</head>
<body>
    <h4>JavaScript</h4>
    <textarea>' . htmlspecialchars($js) . '</textarea>
        
    <h4>CSS</h4>
    <textarea>' . htmlspecialchars($css) . '</textarea>
</body>
</html>');