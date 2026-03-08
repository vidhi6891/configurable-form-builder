import type { FieldPath, FieldUpdater, FormField, MoveDirection } from "../types/form";

const updateContainerAtPath = (
  fields: FormField[],
  containerPath: FieldPath,
  updater: (siblings: FormField[]) => FormField[],
): FormField[] => {
  if (containerPath.length === 0) {
    return updater(fields);
  }

  const [head, ...rest] = containerPath;
  if (head < 0 || head >= fields.length) {
    return fields;
  }

  const targetField = fields[head];
  if (targetField.type !== "group") {
    return fields;
  }

  const nextChildren = updateContainerAtPath(targetField.children, rest, updater);
  if (nextChildren === targetField.children) {
    return fields;
  }

  const nextFields = [...fields];
  nextFields[head] = {
    ...targetField,
    children: nextChildren,
  };

  return nextFields;
};

export const getFieldAtPath = (fields: FormField[], path: FieldPath): FormField | null => {
  if (path.length === 0) {
    return null;
  }

  const [head, ...rest] = path;
  if (head < 0 || head >= fields.length) {
    return null;
  }

  const currentField = fields[head];
  if (rest.length === 0) {
    return currentField;
  }

  if (currentField.type !== "group") {
    return null;
  }

  return getFieldAtPath(currentField.children, rest);
};

export const addFieldAtPath = (
  fields: FormField[],
  parentPath: FieldPath,
  newField: FormField,
): FormField[] => updateContainerAtPath(fields, parentPath, (siblings) => [...siblings, newField]);

export const updateFieldAtPath = (
  fields: FormField[],
  fieldPath: FieldPath,
  updater: FieldUpdater,
): FormField[] => {
  if (fieldPath.length === 0) {
    return fields;
  }

  const parentPath = fieldPath.slice(0, -1);
  const index = fieldPath[fieldPath.length - 1];

  return updateContainerAtPath(fields, parentPath, (siblings) => {
    if (index < 0 || index >= siblings.length) {
      return siblings;
    }

    const currentField = siblings[index];
    const nextField = updater(currentField);
    if (nextField === currentField) {
      return siblings;
    }

    const nextSiblings = [...siblings];
    nextSiblings[index] = nextField;
    return nextSiblings;
  });
};

export const removeFieldAtPath = (fields: FormField[], fieldPath: FieldPath): FormField[] => {
  if (fieldPath.length === 0) {
    return fields;
  }

  const parentPath = fieldPath.slice(0, -1);
  const index = fieldPath[fieldPath.length - 1];

  return updateContainerAtPath(fields, parentPath, (siblings) => {
    if (index < 0 || index >= siblings.length) {
      return siblings;
    }

    const nextSiblings = [...siblings];
    nextSiblings.splice(index, 1);
    return nextSiblings;
  });
};

export const moveFieldAtPath = (
  fields: FormField[],
  fieldPath: FieldPath,
  direction: MoveDirection,
): FormField[] => {
  if (fieldPath.length === 0) {
    return fields;
  }

  const parentPath = fieldPath.slice(0, -1);
  const index = fieldPath[fieldPath.length - 1];

  return updateContainerAtPath(fields, parentPath, (siblings) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || index >= siblings.length || targetIndex < 0 || targetIndex >= siblings.length) {
      return siblings;
    }

    const nextSiblings = [...siblings];
    [nextSiblings[index], nextSiblings[targetIndex]] = [nextSiblings[targetIndex], nextSiblings[index]];
    return nextSiblings;
  });
};
