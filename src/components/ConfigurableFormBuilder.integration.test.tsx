import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ConfigurableFormBuilder } from "./ConfigurableFormBuilder";

const FORM_CONFIG_STORAGE_KEY = "configurable-form-builder:form-config";

const getPreviewPanel = (): HTMLElement => {
  const heading = screen.getByRole("heading", { name: "Live Form Preview" });
  const section = heading.closest("section");

  if (!section) {
    throw new Error("Preview panel not found.");
  }

  return section;
};

describe("ConfigurableFormBuilder integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("updates preview validation immediately for required text fields", async () => {
    const user = userEvent.setup();
    render(<ConfigurableFormBuilder />);

    await user.click(screen.getByRole("button", { name: "Add text field" }));

    await user.clear(screen.getByPlaceholderText("Field label"));
    await user.type(screen.getByPlaceholderText("Field label"), "Full Name");

    await user.click(screen.getByRole("checkbox", { name: "Required" }));

    const previewPanel = getPreviewPanel();
    expect(within(previewPanel).getByText("This field is required.")).toBeInTheDocument();

    await user.type(within(previewPanel).getByPlaceholderText("Enter text"), "Alice");

    expect(within(previewPanel).queryByText("This field is required.")).not.toBeInTheDocument();
    expect(within(previewPanel).getByText("Preview is valid.")).toBeInTheDocument();
  });

  it("imports configuration JSON and exports the reconstructed structure", async () => {
    const user = userEvent.setup();
    render(<ConfigurableFormBuilder />);

    const importPayload = {
      fields: [
        {
          id: "group-1",
          type: "group",
          label: "Profile",
          required: false,
          children: [
            { id: "age", type: "number", label: "Age", required: true, min: 18, max: 99 },
          ],
        },
      ],
    };

    const importTextarea = screen.getByPlaceholderText("Paste configuration JSON here...");
    await user.click(importTextarea);
    await user.paste(JSON.stringify(importPayload));

    await user.click(screen.getByRole("button", { name: "Import form configuration from JSON" }));

    expect(screen.getByText("Configuration imported successfully.")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Age *")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export form configuration as JSON" }));

    const exportTextarea = screen.getByPlaceholderText("Click export to generate JSON...");
    expect((exportTextarea as HTMLTextAreaElement).value).toContain('"label": "Age"');
  });

  it("hydrates initial configuration from localStorage", () => {
    window.localStorage.setItem(
      FORM_CONFIG_STORAGE_KEY,
      JSON.stringify({
        fields: [{ id: "stored-text", type: "text", label: "Stored Label", required: false }],
      }),
    );

    render(<ConfigurableFormBuilder />);

    expect(screen.getByDisplayValue("Stored Label")).toBeInTheDocument();
    expect(screen.getByText("Stored Label")).toBeInTheDocument();
  });
});
