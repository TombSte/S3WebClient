import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareObjectDialog from "./ShareObjectDialog";

describe("ShareObjectDialog", () => {
  it("generates link with chosen expiration", async () => {
    const onGenerate = vi.fn();
    render(
      <ShareObjectDialog open url="" onCancel={() => {}} onGenerate={onGenerate} />
    );

    const dateInput = screen.getByLabelText("Data di scadenza");
    const timeInput = screen.getByLabelText("Ora di scadenza");
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2023-01-02");
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "10:30");
    await userEvent.click(screen.getByRole("button", { name: "Genera" }));

    expect(onGenerate).toHaveBeenCalledWith(new Date("2023-01-02T10:30"));
  });

  it("shows generated url", async () => {
    const onCancel = vi.fn();
    render(
      <ShareObjectDialog
        open
        url="https://example.com"
        onCancel={onCancel}
        onGenerate={() => {}}
      />
    );

    expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Chiudi" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
