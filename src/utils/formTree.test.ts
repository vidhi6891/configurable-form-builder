import { describe, expect, it } from "vitest";
import type { FormField } from "../types/form";
import { addFieldAtPath, moveFieldAtPath, removeFieldAtPath, updateFieldAtPath } from "./formTree";

const makeBaseFields = (): FormField[] => [
  { id: "root-text", type: "text", label: "Root Text", required: false },
  {
    id: "root-group",
    type: "group",
    label: "Group",
    required: false,
    children: [
      { id: "child-a", type: "text", label: "Child A", required: false },
      { id: "child-b", type: "number", label: "Child B", required: true, min: 0, max: 10 },
    ],
  },
];

describe("formTree utilities", () => {
  it("adds a field inside a nested group path", () => {
    const fields = makeBaseFields();
    const addedField: FormField = { id: "child-c", type: "text", label: "Child C", required: false };

    const result = addFieldAtPath(fields, [1], addedField);

    expect(result[1]).toMatchObject({ type: "group" });
    if (result[1].type === "group") {
      expect(result[1].children).toHaveLength(3);
      expect(result[1].children[2]).toEqual(addedField);
    }
  });

  it("updates a field by path", () => {
    const fields = makeBaseFields();

    const result = updateFieldAtPath(fields, [1, 0], (currentField) => ({
      ...currentField,
      label: "Updated Child A",
    }));

    expect(result[1]).toMatchObject({ type: "group" });
    if (result[1].type === "group") {
      expect(result[1].children[0].label).toBe("Updated Child A");
    }
  });

  it("removes a field by path", () => {
    const fields = makeBaseFields();

    const result = removeFieldAtPath(fields, [1, 0]);

    expect(result[1]).toMatchObject({ type: "group" });
    if (result[1].type === "group") {
      expect(result[1].children).toHaveLength(1);
      expect(result[1].children[0].id).toBe("child-b");
    }
  });

  it("moves a field up/down within the same sibling list", () => {
    const fields = makeBaseFields();

    const movedUp = moveFieldAtPath(fields, [1, 1], "up");
    expect(movedUp[1]).toMatchObject({ type: "group" });

    if (movedUp[1].type === "group") {
      expect(movedUp[1].children.map((field) => field.id)).toEqual(["child-b", "child-a"]);
    }

    const movedDown = moveFieldAtPath(movedUp, [1, 0], "down");
    expect(movedDown[1]).toMatchObject({ type: "group" });

    if (movedDown[1].type === "group") {
      expect(movedDown[1].children.map((field) => field.id)).toEqual(["child-a", "child-b"]);
    }
  });
});
