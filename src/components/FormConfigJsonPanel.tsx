import type { ChangeEvent } from "react";
import "../styles/json.css";

interface FormConfigJsonPanelProps {
  exportText: string;
  importText: string;
  importError: string | null;
  importSuccessMessage: string | null;
  onExportConfig: () => void;
  onImportTextChange: (value: string) => void;
  onImportConfig: () => void;
}

export const FormConfigJsonPanel = ({
  exportText,
  importText,
  importError,
  importSuccessMessage,
  onExportConfig,
  onImportTextChange,
  onImportConfig,
}: FormConfigJsonPanelProps) => {
  const importErrorId = "json-import-error";

  const handleImportTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onImportTextChange(event.target.value);
  };

  return (
    <section className="panel json-panel">
      <div className="panel__header">
        <h2>Form Configuration JSON</h2>
        <p>Export the full configuration or import JSON to rebuild the form tree.</p>
      </div>

      <div className="json-panel__columns">
        <div className="json-panel__section">
          <h3>Export</h3>
          <button type="button" aria-label="Export form configuration as JSON" onClick={onExportConfig}>
            Export Configuration
          </button>
          <textarea
            className="json-panel__textarea"
            value={exportText}
            readOnly
            placeholder="Click export to generate JSON..."
          />
        </div>

        <div className="json-panel__section">
          <h3>Import</h3>
          <button type="button" aria-label="Import form configuration from JSON" onClick={onImportConfig}>
            Import Configuration
          </button>
          <textarea
            className="json-panel__textarea"
            value={importText}
            onChange={handleImportTextChange}
            placeholder="Paste configuration JSON here..."
            aria-invalid={Boolean(importError)}
            aria-describedby={importError ? importErrorId : undefined}
          />

          {importError && (
            <p id={importErrorId} className="json-panel__message json-panel__message--error">
              {importError}
            </p>
          )}
          {importSuccessMessage && (
            <p className="json-panel__message json-panel__message--success">{importSuccessMessage}</p>
          )}
        </div>
      </div>
    </section>
  );
};
