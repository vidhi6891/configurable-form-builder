import { FormFieldCollectionEditor } from "./FormFieldCollectionEditor";
import type { FieldPath, FieldType, FieldUpdater, FormField, MoveDirection } from "../types/form";

interface FormStructureEditorProps {
  fields: FormField[];
  onAddField: (parentPath: FieldPath, type: FieldType) => void;
  onUpdateField: (path: FieldPath, updater: FieldUpdater) => void;
  onDeleteField: (path: FieldPath) => void;
  onMoveField: (path: FieldPath, direction: MoveDirection) => void;
}

export const FormStructureEditor = ({
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
}: FormStructureEditorProps) => {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Form Structure Editor</h2>
        <p>Create fields, configure constraints, and nest groups recursively.</p>
      </div>

      <FormFieldCollectionEditor
        fields={fields}
        parentPath={[]}
        depth={0}
        onAddField={onAddField}
        onUpdateField={onUpdateField}
        onDeleteField={onDeleteField}
        onMoveField={onMoveField}
      />
    </section>
  );
};
