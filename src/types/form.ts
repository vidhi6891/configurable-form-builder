export type FieldType = "text" | "number" | "group";

export type FieldPath = number[];

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
}

export interface TextField extends BaseField {
  type: "text";
}

export interface NumberField extends BaseField {
  type: "number";
  min: number | null;
  max: number | null;
}

export interface GroupField extends BaseField {
  type: "group";
  children: FormField[];
}

export type FormField = TextField | NumberField | GroupField;

export interface FormConfig {
  fields: FormField[];
}

export type FieldUpdater = (field: FormField) => FormField;
export type MoveDirection = "up" | "down";

export type PreviewValues = Record<string, string>;
export type PreviewErrors = Record<string, string>;
