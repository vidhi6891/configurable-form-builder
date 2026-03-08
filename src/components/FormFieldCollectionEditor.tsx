import { FormFieldNodeEditor } from "./FormFieldNodeEditor";
import type { FieldPath, FieldType, FieldUpdater, FormField, MoveDirection } from "../types/form";

interface FormFieldCollectionEditorProps {
  fields: FormField[];
  parentPath: FieldPath;
  depth: number;
  onAddField: (parentPath: FieldPath, type: FieldType) => void;
  onUpdateField: (path: FieldPath, updater: FieldUpdater) => void;
  onDeleteField: (path: FieldPath) => void;
  onMoveField: (path: FieldPath, direction: MoveDirection) => void;
}

export const FormFieldCollectionEditor = ({
  fields,
  parentPath,
  depth,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
}: FormFieldCollectionEditorProps) => {
  return (
    <div className="field-list-editor" data-depth={depth}>
      {fields.length === 0 && <p className="field-list-editor__empty">No fields in this level yet.</p>}

      {fields.map((field, index) => {
        const fieldPath = [...parentPath, index];

        return (
          <div key={`${field.id}-${index}`} className="field-list-editor__node">
            <FormFieldNodeEditor
              field={field}
              path={fieldPath}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
              onUpdateField={onUpdateField}
              onDeleteField={onDeleteField}
              onMoveField={onMoveField}
            />

            {field.type === "group" && (
              <div className="field-list-editor__children">
                <FormFieldCollectionEditor
                  fields={field.children}
                  parentPath={fieldPath}
                  depth={depth + 1}
                  onAddField={onAddField}
                  onUpdateField={onUpdateField}
                  onDeleteField={onDeleteField}
                  onMoveField={onMoveField}
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="field-list-editor__add-controls">
        <button type="button" aria-label="Add text field" onClick={() => onAddField(parentPath, "text")}>
          + Text
        </button>
        <button type="button" aria-label="Add number field" onClick={() => onAddField(parentPath, "number")}>
          + Number
        </button>
        <button type="button" aria-label="Add group field" onClick={() => onAddField(parentPath, "group")}>
          + Group
        </button>
      </div>
    </div>
  );
};
