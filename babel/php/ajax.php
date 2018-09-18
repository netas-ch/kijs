<?php
    $responses = array();
        
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        
        switch ($request->facadeFn) {
            case 'minify.load':
                try {
                    $response->formData = array(
                        'es2015'=>true,
                        'minify'=>true
                    );
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'minify.minifyJs':
                try {
                    require_once '../lib/jsmin/JSMin.php';
                    $response->data = JSMin::minify($request->data);
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'minify.minifyCss':
                try {
                    require_once '../lib/cssmin/cssmin.php';
                    $response->data = cssmin::minify($request->data);
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
          
            
            default:
                $response->errorMsg = 'FacadeFn "' . $request->facadeFn . '" existiert nicht.';
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    