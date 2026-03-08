import { useCallback } from "react";
import { FormConfigJsonPanel } from "./FormConfigJsonPanel";
import { FormStructureEditor } from "./FormStructureEditor";
import { LiveFormPreview } from "./LiveFormPreview";
import { useFormBuilderConfig } from "../hooks/useFormBuilderConfig";
import { useFormConfigJson } from "../hooks/useFormConfigJson";
import { useLiveFormValues } from "../hooks/useLiveFormValues";

export const ConfigurableFormBuilder = () => {
  const { config, addField, updateField, deleteField, moveField, replaceConfig, resetConfig } =
    useFormBuilderConfig();

  const { values, errors, isValid, setFieldValue, resetValues } = useLiveFormValues(config.fields);

  const {
    exportText,
    importText,
    importError,
    importSuccessMessage,
    exportConfig,
    importConfig,
    updateImportText,
    resetJsonPanel,
  } = useFormConfigJson({
    config,
    onImportConfig: replaceConfig,
  });

  const handleResetBuilder = useCallback(() => {
    resetConfig();
    resetValues();
    resetJsonPanel();
  }, [resetConfig, resetValues, resetJsonPanel]);

  return (
    <main className="builder-shell">
      <header className="builder-header">
        <div>
          <h1>Configurable Form Builder</h1>
          <p>Build nested form schemas, preview behavior live, and exchange configurations as JSON.</p>
        </div>

        <button type="button" className="button-danger" aria-label="Reset builder" onClick={handleResetBuilder}>
          Reset Builder
        </button>
      </header>

      <div className="builder-grid">
        <FormStructureEditor
          fields={config.fields}
          onAddField={addField}
          onUpdateField={updateField}
          onDeleteField={deleteField}
          onMoveField={moveField}
        />

        <LiveFormPreview
          fields={config.fields}
          values={values}
          errors={errors}
          isValid={isValid}
          onValueChange={setFieldValue}
        />
      </div>

      <FormConfigJsonPanel
        exportText={exportText}
        importText={importText}
        importError={importError}
        importSuccessMessage={importSuccessMessage}
        onExportConfig={exportConfig}
        onImportTextChange={updateImportText}
        onImportConfig={importConfig}
      />
    </main>
  );
};
