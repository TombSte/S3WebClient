import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenameObjectDialog from "./RenameObjectDialog";

describe("RenameObjectDialog", () => {
  it("pre-fills current name and confirms with new name", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RenameObjectDialog
        open
        currentName="file.txt"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByDisplayValue("file.txt");
    await userEvent.clear(input);
    await userEvent.type(input, "renamed.txt");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onConfirm).toHaveBeenCalledWith("renamed.txt");
  });
});
