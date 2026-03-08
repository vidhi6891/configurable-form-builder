import { useCallback, useEffect, useReducer } from "react";
import { createField } from "../utils/createField";
import { addFieldAtPath, moveFieldAtPath, removeFieldAtPath, updateFieldAtPath } from "../utils/formTree";
import { parseFormConfigJson } from "../utils/formValidation";
import type { FieldPath, FieldType, FieldUpdater, FormConfig, MoveDirection } from "../types/form";

type BuilderAction =
  | { type: "add-field"; parentPath: FieldPath; fieldType: FieldType }
  | { type: "update-field"; path: FieldPath; updater: FieldUpdater }
  | { type: "delete-field"; path: FieldPath }
  | { type: "move-field"; path: FieldPath; direction: MoveDirection }
  | { type: "replace-config"; config: FormConfig };

const initialConfig: FormConfig = {
  fields: [],
};

const FORM_CONFIG_STORAGE_KEY = "configurable-form-builder:form-config";

const hydrateInitialConfig = (fallbackConfig: FormConfig): FormConfig => {
  if (typeof window === "undefined") {
    return fallbackConfig;
  }

  const storedConfig = window.localStorage.getItem(FORM_CONFIG_STORAGE_KEY);
  if (!storedConfig) {
    return fallbackConfig;
  }

  const parsedConfig = parseFormConfigJson(storedConfig);
  return parsedConfig.config ?? fallbackConfig;
};

const formBuilderReducer = (state: FormConfig, action: BuilderAction): FormConfig => {
  switch (action.type) {
    case "add-field":
      return {
        ...state,
        fields: addFieldAtPath(state.fields, action.parentPath, createField(action.fieldType)),
      };

    case "update-field":
      return {
        ...state,
        fields: updateFieldAtPath(state.fields, action.path, action.updater),
      };

    case "delete-field":
      return {
        ...state,
        fields: removeFieldAtPath(state.fields, action.path),
      };

    case "move-field":
      return {
        ...state,
        fields: moveFieldAtPath(state.fields, action.path, action.direction),
      };

    case "replace-config":
      return action.config;

    default:
      return state;
  }
};

export const useFormBuilderConfig = () => {
  const [config, dispatch] = useReducer(formBuilderReducer, initialConfig, hydrateInitialConfig);

  useEffect(() => {
    if (config.fields.length === 0) {
      window.localStorage.removeItem(FORM_CONFIG_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(FORM_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const addField = useCallback((parentPath: FieldPath, fieldType: FieldType) => {
    dispatch({ type: "add-field", parentPath, fieldType });
  }, []);

  const updateField = useCallback((path: FieldPath, updater: FieldUpdater) => {
    dispatch({ type: "update-field", path, updater });
  }, []);

  const deleteField = useCallback((path: FieldPath) => {
    dispatch({ type: "delete-field", path });
  }, []);

  const moveField = useCallback((path: FieldPath, direction: MoveDirection) => {
    dispatch({ type: "move-field", path, direction });
  }, []);

  const replaceConfig = useCallback((nextConfig: FormConfig) => {
    dispatch({ type: "replace-config", config: nextConfig });
  }, []);

  const resetConfig = useCallback(() => {
    dispatch({ type: "replace-config", config: initialConfig });
  }, []);

  return {
    config,
    addField,
    updateField,
    deleteField,
    moveField,
    replaceConfig,
    resetConfig,
  };
};
