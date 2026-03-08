import { useCallback, useState } from "react";
import { parseFormConfigJson } from "../utils/formValidation";
import type { FormConfig } from "../types/form";

interface UseFormConfigJsonOptions {
  config: FormConfig;
  onImportConfig: (config: FormConfig) => void;
}

export const useFormConfigJson = ({ config, onImportConfig }: UseFormConfigJsonOptions) => {
  const [exportText, setExportText] = useState<string>("");
  const [importText, setImportText] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const exportConfig = useCallback(() => {
    setExportText(JSON.stringify(config, null, 2));
  }, [config]);

  const importConfig = useCallback(() => {
    const result = parseFormConfigJson(importText);
    if (!result.config) {
      setImportError(result.error ?? "Failed to import configuration.");
      setImportSuccessMessage(null);
      return;
    }

    onImportConfig(result.config);
    setImportError(null);
    setImportSuccessMessage("Configuration imported successfully.");
    setExportText(JSON.stringify(result.config, null, 2));
  }, [importText, onImportConfig]);

  const updateImportText = useCallback((value: string) => {
    setImportText(value);
    setImportError(null);
    setImportSuccessMessage(null);
  }, []);

  const resetJsonPanel = useCallback(() => {
    setExportText("");
    setImportText("");
    setImportError(null);
    setImportSuccessMessage(null);
  }, []);

  return {
    exportText,
    importText,
    importError,
    importSuccessMessage,
    exportConfig,
    importConfig,
    updateImportText,
    resetJsonPanel,
  };
};
