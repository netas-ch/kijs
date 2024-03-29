<?php
    // Eigene Exception
    class ki_Exception_Notice extends Exception {}

    $responses = array();
    
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        $response->responseData = new stdClass();
        
        switch ($request->remoteFn) {
            
            case 'myFacade.myFunction':
                try {
                    $response->responseData = $request->requestData;
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                    $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
                }
                break;
            
            case 'myFacade.myErrorNoticeFunction':
                try {
                    $response->responseData = $request->requestData;
                    throw new ki_Exception_Notice('Fehler, aber nicht tragisch.');
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                    $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
                }
                break;
            
            case 'myFacade.myErrorFunction':
                try {
                    $response->responseData = $request->requestData;
                    throw new Exception('Fehler! Schrecklich!!!');
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                    $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
                }
                break;
            
            case 'color.load':
                try {
                    $rows = array();
                    
                    $rows[] = array('Bez'=>'rot', 'color'=>'#f00', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'grün', 'color'=>'#0f0', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'blau', 'color'=>'#00f', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'gelb', 'color'=>'#ff0', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'violett', 'color'=>'#f0f', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'hellblau', 'color'=>'#0ff', 'iconChar'=>'&#xf111');
                    $response->responseData->rows = $rows;

                    //sleep(1);
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                    $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
                }
                break;
            
            default:
                
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    