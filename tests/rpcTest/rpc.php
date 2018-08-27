<?php
    $responses = array();
    
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        $response->data = new stdClass();
        
        switch ($request->facadeFn) {
            
            case 'myFacade.myFunction':
                try {
                    $response->data = $request->data;
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            default:
                
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    