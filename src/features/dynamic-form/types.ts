/*
 * @Author: Libra
 * @Date: 2025-11-07 16:52:33
 * @LastEditors: Libra
 * @Description:
 */
import type { z } from "zod";

export type DynamicFieldBase = {
  id: string;
  label: string;
  description?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showIf?: {
    field: string;
    equals: unknown;
  };
};

export type DynamicTextField = DynamicFieldBase & {
  type: "text" | "email" | "number" | "url" | "password";
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
};

export type DynamicTextareaField = DynamicFieldBase & {
  type: "textarea";
  rows?: number;
  maxLength?: number;
};

export type DynamicSelectField = DynamicFieldBase & {
  type: "select";
  options: Array<{ value: string; label: string }>;
};

export type DynamicCheckboxField = DynamicFieldBase & {
  type: "checkbox";
};

export type DynamicSwitchField = DynamicFieldBase & {
  type: "switch";
};

export type DynamicFieldDefinition =
  | DynamicTextField
  | DynamicTextareaField
  | DynamicSelectField
  | DynamicCheckboxField
  | DynamicSwitchField;

export type DynamicFormSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;

export type DynamicFormValues = Record<string, unknown>;
