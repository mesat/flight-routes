package com.thy.flightroutes.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;

class EnumValidatorImpl implements ConstraintValidator<EnumValidators, Enum<?>> {
    private Class<? extends Enum<?>> enumClass;

    @Override
    public void initialize(EnumValidators constraintAnnotation) {
        this.enumClass = constraintAnnotation.enumClass();
    }

    @Override
    public boolean isValid(Enum<?> value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return Arrays.asList(enumClass.getEnumConstants()).contains(value);
    }
}
