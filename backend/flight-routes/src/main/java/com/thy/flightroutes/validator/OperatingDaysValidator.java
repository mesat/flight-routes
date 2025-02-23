package com.thy.flightroutes.validator;


import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;

class OperatingDaysValidatorImpl implements ConstraintValidator<OperatingDaysValidator, List<Integer>> {
    @Override
    public boolean isValid(List<Integer> days, ConstraintValidatorContext context) {
        if (days == null || days.isEmpty()) {
            return false;
        }
        return days.stream()
                .allMatch(day -> day >= 1 && day <= 7);
    }
}


@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OperatingDaysValidatorImpl.class)
public @interface OperatingDaysValidator {
    String message() default "Invalid operating days";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}