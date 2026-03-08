import type { FieldType, FormField, GroupField, NumberField, TextField } from "../types/form";

let fallbackIdCounter = 0;

export const createFieldId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  fallbackIdCounter += 1;
  return `field-${Date.now()}-${fallbackIdCounter}`;
};

export const createField = (type: FieldType): FormField => {
  const id = createFieldId();

  if (type === "text") {
    const textField: TextField = {
      id,
      type,
      label: "Untitled Text Field",
      required: false,
    };

    return textField;
  }

  if (type === "number") {
    const numberField: NumberField = {
      id,
      type,
      label: "Untitled Number Field",
      required: false,
      min: null,
      max: null,
    };

    return numberField;
  }

  const groupField: GroupField = {
    id,
    type,
    label: "Untitled Group",
    required: false,
    children: [],
  };

  return groupField;
};
