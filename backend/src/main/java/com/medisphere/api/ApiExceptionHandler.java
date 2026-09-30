package com.medisphere.api;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<Map<String,Object>> handleStatus(ResponseStatusException e){
   return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()==null?"Request failed":e.getReason()));
 }

 @ExceptionHandler(Exception.class)
 ResponseEntity<Map<String,Object>> handle(Exception e){
   return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()==null?"Request failed":e.getMessage()));
 }
}
