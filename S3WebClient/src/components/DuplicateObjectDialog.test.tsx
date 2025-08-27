import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DuplicateObjectDialog from "./DuplicateObjectDialog";

describe("DuplicateObjectDialog", () => {
  it("pre-fills current name and confirms with new name", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <DuplicateObjectDialog
        open
        currentName="file.txt"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByDisplayValue("file.txt");
    await userEvent.clear(input);
    await userEvent.type(input, "copy.txt");
    await userEvent.click(screen.getByRole("button", { name: "Duplicate" }));

    expect(onConfirm).toHaveBeenCalledWith("copy.txt");
  });
});
