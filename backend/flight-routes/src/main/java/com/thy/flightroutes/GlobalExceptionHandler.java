package com.thy.flightroutes;

import com.thy.flightroutes.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@Hidden
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ApiError handleValidationErrors(MethodArgumentNotValidException ex) {
        log.error(ex.getMessage(), ex);
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> String.format("%s: %s", error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        return new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Validation error",
                errors
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    private ApiError handleResourceNotFound(ResourceNotFoundException ex) {
        log.error(ex.getMessage(), ex);
        return new ApiError(
                HttpStatus.NOT_FOUND.value(),
                "Resource not found",
                Collections.singletonList(ex.getMessage())
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ApiError handleIllegalArgument(IllegalArgumentException ex) {
        log.error(ex.getMessage(), ex);
        return new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid request",
                Collections.singletonList(ex.getMessage())
        );
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ApiError handleIllegalArgument(DataIntegrityViolationException ex) {
        log.error(ex.getMessage(), ex);
        return new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Data Integrity Violation",
                Collections.singletonList(ex.getMessage())
        );
    }
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public Map<String,Object> handle404(NoHandlerFoundException ex) {
        return Map.of(
                "status", 404,
                "error", "Not Found",
                "message", "Geçersiz endpoint: " + ex.getRequestURL()
        );
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    private ApiError handleAllUncaughtException(Exception ex) {
        log.error(ex.getMessage(), ex);
        return new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal server error",
                List.of("An unexpected error occurred")
        );
    }
}

@Data
@AllArgsConstructor
class ApiError {
    private int status;
    private String message;
    private List<String> errors;
}
