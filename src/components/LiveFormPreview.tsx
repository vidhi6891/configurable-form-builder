import type { ChangeEvent } from "react";
import type { FormField, PreviewErrors, PreviewValues } from "../types/form";

interface LiveFormPreviewProps {
  fields: FormField[];
  values: PreviewValues;
  errors: PreviewErrors;
  isValid: boolean;
  onValueChange: (fieldId: string, value: string) => void;
}

interface PreviewFieldListProps {
  fields: FormField[];
  values: PreviewValues;
  errors: PreviewErrors;
  onValueChange: (fieldId: string, value: string) => void;
}

const fieldLabel = (field: FormField): string => {
  if (field.label.trim().length > 0) {
    return field.label;
  }

  if (field.type === "group") {
    return "Untitled Group";
  }

  return `Untitled ${field.type} field`;
};

const PreviewFieldList = ({ fields, values, errors, onValueChange }: PreviewFieldListProps) => {
  return (
    <div className="preview-field-list">
      {fields.map((field, index) => {
        if (field.type === "group") {
          return (
            <fieldset key={`${field.id}-${index}`} className="preview-group">
              <legend>
                {fieldLabel(field)}
                {field.required ? " *" : ""}
              </legend>

              <PreviewFieldList
                fields={field.children}
                values={values}
                errors={errors}
                onValueChange={onValueChange}
              />

              {errors[field.id] && <p className="preview-error">{errors[field.id]}</p>}
            </fieldset>
          );
        }

        const value = values[field.id] ?? "";
        const errorId = `preview-error-${field.id}`;
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          onValueChange(field.id, event.target.value);
        };

        return (
          <label key={`${field.id}-${index}`} className="preview-control">
            <span>
              {fieldLabel(field)}
              {field.required ? " *" : ""}
            </span>

            <input
              type="text"
              inputMode={field.type === "number" ? "decimal" : undefined}
              value={value}
              onChange={handleChange}
              placeholder={field.type === "number" ? "Enter a number" : "Enter text"}
              aria-invalid={Boolean(errors[field.id])}
              aria-describedby={errors[field.id] ? errorId : undefined}
            />

            {errors[field.id] && (
              <span id={errorId} className="preview-error">
                {errors[field.id]}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
};

export const LiveFormPreview = ({ fields, values, errors, isValid, onValueChange }: LiveFormPreviewProps) => {
  const errorCount = Object.keys(errors).length;

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Live Form Preview</h2>
        <p>The preview updates instantly as you edit the structure.</p>
      </div>

      {fields.length === 0 ? (
        <p className="preview-empty">Add fields in the editor to start the preview.</p>
      ) : (
        <PreviewFieldList fields={fields} values={values} errors={errors} onValueChange={onValueChange} />
      )}

      <div className={`preview-status ${isValid ? "preview-status--valid" : "preview-status--invalid"}`}>
        {isValid ? "Preview is valid." : `${errorCount} validation issue${errorCount === 1 ? "" : "s"} found.`}
      </div>
    </section>
  );
};
