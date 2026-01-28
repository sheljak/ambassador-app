/**
 * FormInput Component
 * Input component integrated with react-hook-form Controller
 */

import React from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { Input, InputProps } from './Input';

export interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  rules,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
