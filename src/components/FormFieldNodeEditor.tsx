import type { ChangeEvent } from "react";
import type { FieldPath, FieldUpdater, FormField, MoveDirection, NumberField } from "../types/form";

interface FormFieldNodeEditorProps {
  field: FormField;
  path: FieldPath;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdateField: (path: FieldPath, updater: FieldUpdater) => void;
  onDeleteField: (path: FieldPath) => void;
  onMoveField: (path: FieldPath, direction: MoveDirection) => void;
}

const parseNumericConstraint = (event: ChangeEvent<HTMLInputElement>): number | null => {
  const rawValue = event.target.value;
  if (rawValue.trim().length === 0) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
};

export const FormFieldNodeEditor = ({
  field,
  path,
  canMoveUp,
  canMoveDown,
  onUpdateField,
  onDeleteField,
  onMoveField,
}: FormFieldNodeEditorProps) => {
  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const label = event.target.value;
    onUpdateField(path, (currentField) => ({ ...currentField, label }));
  };

  const handleRequiredChange = (event: ChangeEvent<HTMLInputElement>) => {
    const required = event.target.checked;
    onUpdateField(path, (currentField) => ({ ...currentField, required }));
  };

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const min = parseNumericConstraint(event);
    onUpdateField(path, (currentField) => {
      if (currentField.type !== "number") {
        return currentField;
      }

      return {
        ...currentField,
        min,
      };
    });
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const max = parseNumericConstraint(event);
    onUpdateField(path, (currentField) => {
      if (currentField.type !== "number") {
        return currentField;
      }

      return {
        ...currentField,
        max,
      };
    });
  };

  const numberField = field.type === "number" ? (field as NumberField) : null;
  const numberConstraintError =
    numberField && numberField.min !== null && numberField.max !== null && numberField.min > numberField.max
      ? "Min must be less than or equal to max."
      : null;
  const numberConstraintErrorId = `number-constraint-error-${field.id}`;

  return (
    <div className="field-editor">
      <div className="field-editor__header">
        <div className="field-editor__identity">
          <span className={`field-type field-type--${field.type}`}>{field.type}</span>
        </div>

        <div className="field-editor__actions">
          <button
            type="button"
            aria-label={`Move ${field.type} field up`}
            disabled={!canMoveUp}
            onClick={() => onMoveField(path, "up")}
          >
            Move Up
          </button>
          <button
            type="button"
            aria-label={`Move ${field.type} field down`}
            disabled={!canMoveDown}
            onClick={() => onMoveField(path, "down")}
          >
            Move Down
          </button>
          <button
            type="button"
            className="button-danger"
            aria-label={`Delete ${field.type} field`}
            onClick={() => onDeleteField(path)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="field-editor__body">
        <label className="form-control">
          <span>Label</span>
          <input type="text" value={field.label} onChange={handleLabelChange} placeholder="Field label" />
        </label>

        <label className="checkbox-control">
          <input type="checkbox" checked={field.required} onChange={handleRequiredChange} />
          <span>Required</span>
        </label>

        {numberField && (
          <>
            <div className="field-editor__number-grid">
              <label className="form-control">
                <span>Min</span>
                <input
                  type="number"
                  value={numberField.min ?? ""}
                  onChange={handleMinChange}
                  placeholder="Optional"
                  aria-invalid={Boolean(numberConstraintError)}
                  aria-describedby={numberConstraintError ? numberConstraintErrorId : undefined}
                />
              </label>

              <label className="form-control">
                <span>Max</span>
                <input
                  type="number"
                  value={numberField.max ?? ""}
                  onChange={handleMaxChange}
                  placeholder="Optional"
                  aria-invalid={Boolean(numberConstraintError)}
                  aria-describedby={numberConstraintError ? numberConstraintErrorId : undefined}
                />
              </label>
            </div>

            {numberConstraintError && (
              <p id={numberConstraintErrorId} className="field-editor__error">
                {numberConstraintError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
