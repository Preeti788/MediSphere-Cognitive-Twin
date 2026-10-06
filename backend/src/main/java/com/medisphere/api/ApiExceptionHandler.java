package com.medisphere.api;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(Exception.class)
 ResponseEntity<Map<String,Object>> handle(Exception e){
   return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()==null?"Request failed":e.getMessage()));
 }
}
