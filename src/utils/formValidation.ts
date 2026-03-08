import { createFieldId } from "./createField";
import type { FormConfig, FormField, PreviewErrors, PreviewValues } from "../types/form";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseOptionalNumber = (
  value: unknown,
  fieldPath: string,
): { value: number | null; error?: string } => {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return { value };
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return { value: parsed };
    }
  }

  return {
    value: null,
    error: `Invalid value at ${fieldPath}. Expected a number or null.`,
  };
};

const normalizeField = (
  input: unknown,
  path: string,
): { field: FormField | null; error?: string } => {
  if (!isRecord(input)) {
    return { field: null, error: `Invalid field at ${path}. Expected an object.` };
  }

  if (input.type !== "text" && input.type !== "number" && input.type !== "group") {
    return {
      field: null,
      error: `Invalid field type at ${path}. Supported types are text, number, and group.`,
    };
  }

  const id = typeof input.id === "string" && input.id.trim().length > 0 ? input.id : createFieldId();
  const label = typeof input.label === "string" ? input.label : "";
  const required = typeof input.required === "boolean" ? input.required : false;

  if (input.type === "text") {
    return {
      field: {
        id,
        type: "text",
        label,
        required,
      },
    };
  }

  if (input.type === "number") {
    const min = parseOptionalNumber(input.min, `${path}.min`);
    if (min.error) {
      return { field: null, error: min.error };
    }

    const max = parseOptionalNumber(input.max, `${path}.max`);
    if (max.error) {
      return { field: null, error: max.error };
    }

    if (min.value !== null && max.value !== null && min.value > max.value) {
      return {
        field: null,
        error: `Invalid number constraints at ${path}. min must be less than or equal to max.`,
      };
    }

    return {
      field: {
        id,
        type: "number",
        label,
        required,
        min: min.value,
        max: max.value,
      },
    };
  }

  if (input.children !== undefined && !Array.isArray(input.children)) {
    return {
      field: null,
      error: `Invalid children at ${path}. Group children must be an array.`,
    };
  }

  const rawChildren = Array.isArray(input.children) ? input.children : [];
  const children: FormField[] = [];

  for (let index = 0; index < rawChildren.length; index += 1) {
    const childResult = normalizeField(rawChildren[index], `${path}.children[${index}]`);
    if (childResult.error || !childResult.field) {
      return { field: null, error: childResult.error };
    }

    children.push(childResult.field);
  }

  return {
    field: {
      id,
      type: "group",
      label,
      required,
      children,
    },
  };
};

const normalizeConfig = (input: unknown): { config: FormConfig | null; error?: string } => {
  const rawFields = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.fields)
      ? input.fields
      : null;

  if (!rawFields) {
    return {
      config: null,
      error: "Invalid configuration. Provide either an array of fields or an object with a fields array.",
    };
  }

  const fields: FormField[] = [];

  for (let index = 0; index < rawFields.length; index += 1) {
    const fieldResult = normalizeField(rawFields[index], `fields[${index}]`);
    if (fieldResult.error || !fieldResult.field) {
      return { config: null, error: fieldResult.error };
    }

    fields.push(fieldResult.field);
  }

  return { config: { fields } };
};

export const parseFormConfigJson = (jsonText: string): { config: FormConfig | null; error?: string } => {
  if (jsonText.trim().length === 0) {
    return { config: null, error: "Import JSON cannot be empty." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { config: null, error: "Invalid JSON format." };
  }

  return normalizeConfig(parsed);
};

const hasValue = (value: string | undefined): boolean =>
  typeof value === "string" && value.trim().length > 0;

const hasAnyValueInField = (field: FormField, values: PreviewValues): boolean => {
  if (field.type === "group") {
    return field.children.some((child) => hasAnyValueInField(child, values));
  }

  return hasValue(values[field.id]);
};

const DECIMAL_NUMBER_PATTERN = /^-?(?:\d+\.?\d*|\.\d+)$/;

const parsePreviewNumber = (rawValue: string): number | null => {
  const trimmed = rawValue.trim();
  if (!DECIMAL_NUMBER_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const validatePreviewValues = (fields: FormField[], values: PreviewValues): PreviewErrors => {
  const errors: PreviewErrors = {};

  const visitField = (field: FormField): void => {
    if (field.type === "group") {
      if (field.required && !field.children.some((child) => hasAnyValueInField(child, values))) {
        errors[field.id] = "Complete at least one field in this group.";
      }

      field.children.forEach(visitField);
      return;
    }

    const rawValue = values[field.id] ?? "";
    if (field.required && rawValue.trim().length === 0) {
      errors[field.id] = "This field is required.";
      return;
    }

    if (field.type === "number") {
      if (field.min !== null && field.max !== null && field.min > field.max) {
        errors[field.id] = "Invalid number range. Min cannot be greater than max.";
        return;
      }
    }

    if (field.type === "number" && rawValue.trim().length > 0) {
      const parsed = parsePreviewNumber(rawValue);
      if (parsed === null) {
        errors[field.id] = "Enter a valid number.";
        return;
      }

      if (field.min !== null && parsed < field.min) {
        errors[field.id] = `Value must be at least ${field.min}.`;
        return;
      }

      if (field.max !== null && parsed > field.max) {
        errors[field.id] = `Value must be at most ${field.max}.`;
      }
    }
  };

  fields.forEach(visitField);
  return errors;
};
