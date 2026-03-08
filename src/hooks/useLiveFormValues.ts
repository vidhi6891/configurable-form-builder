import { useCallback, useEffect, useMemo, useState } from "react";
import { validatePreviewValues } from "../utils/formValidation";
import type { FormField, PreviewValues } from "../types/form";

const PREVIEW_VALUES_STORAGE_KEY = "configurable-form-builder:preview-values";

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
};

const hydratePreviewValues = (): PreviewValues => {
  if (typeof window === "undefined") {
    return {};
  }

  const storedValues = window.localStorage.getItem(PREVIEW_VALUES_STORAGE_KEY);
  if (!storedValues) {
    return {};
  }

  try {
    const parsedValues: unknown = JSON.parse(storedValues);
    return isStringRecord(parsedValues) ? parsedValues : {};
  } catch {
    return {};
  }
};

export const useLiveFormValues = (fields: FormField[]) => {
  const [values, setValues] = useState<PreviewValues>(hydratePreviewValues);

  useEffect(() => {
    if (Object.keys(values).length === 0) {
      window.localStorage.removeItem(PREVIEW_VALUES_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(PREVIEW_VALUES_STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const setFieldValue = useCallback((fieldId: string, value: string) => {
    setValues((previousValues) => ({
      ...previousValues,
      [fieldId]: value,
    }));
  }, []);

  const resetValues = useCallback(() => {
    setValues({});
  }, []);

  const errors = useMemo(() => validatePreviewValues(fields, values), [fields, values]);
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    isValid,
    setFieldValue,
    resetValues,
  };
};
