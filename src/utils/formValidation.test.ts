import { describe, expect, it } from "vitest";
import type { FormField } from "../types/form";
import { parseFormConfigJson, validatePreviewValues } from "./formValidation";

describe("parseFormConfigJson", () => {
  it("parses a valid config object", () => {
    const json = JSON.stringify({
      fields: [
        { id: "name", type: "text", label: "Name", required: true },
        { id: "age", type: "number", label: "Age", required: false, min: 18, max: 99 },
      ],
    });

    const result = parseFormConfigJson(json);

    expect(result.error).toBeUndefined();
    expect(result.config?.fields).toHaveLength(2);
  });

  it("rejects invalid number constraints", () => {
    const json = JSON.stringify({
      fields: [{ id: "age", type: "number", label: "Age", required: false, min: 10, max: 2 }],
    });

    const result = parseFormConfigJson(json);

    expect(result.config).toBeNull();
    expect(result.error).toContain("min must be less than or equal to max");
  });
});

describe("validatePreviewValues", () => {
  const fields: FormField[] = [
    { id: "name", type: "text", label: "Name", required: true },
    { id: "age", type: "number", label: "Age", required: false, min: 0, max: 120 },
  ];

  it("validates required text fields", () => {
    const errors = validatePreviewValues(fields, { name: "", age: "" });

    expect(errors.name).toBe("This field is required.");
  });

  it("validates invalid number input", () => {
    const errors = validatePreviewValues(fields, { name: "Alice", age: "abc" });

    expect(errors.age).toBe("Enter a valid number.");
  });

  it("validates min/max bounds", () => {
    const tooSmall = validatePreviewValues(fields, { name: "Alice", age: "-1" });
    const tooLarge = validatePreviewValues(fields, { name: "Alice", age: "121" });

    expect(tooSmall.age).toBe("Value must be at least 0.");
    expect(tooLarge.age).toBe("Value must be at most 120.");
  });

  it("returns no errors for valid values", () => {
    const errors = validatePreviewValues(fields, { name: "Alice", age: "31" });

    expect(errors).toEqual({});
  });

  it("reports invalid field setup when min is greater than max", () => {
    const invalidConfigFields: FormField[] = [
      { id: "broken", type: "number", label: "Broken", required: false, min: 10, max: 2 },
    ];

    const errors = validatePreviewValues(invalidConfigFields, { broken: "5" });

    expect(errors.broken).toBe("Invalid number range. Min cannot be greater than max.");
  });
});
