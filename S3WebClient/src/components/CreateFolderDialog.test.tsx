import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateFolderDialog from "./CreateFolderDialog";
import type { S3Connection } from "../types/s3";
import { objectService } from "../repositories";

vi.mock("../repositories", () => ({
  objectService: {
    fetchChildren: vi.fn(),
    createFolder: vi.fn(),
  },
}));

describe("CreateFolderDialog", () => {
  const connection = { id: "c1" } as S3Connection;
  const fetchChildren = objectService.fetchChildren as unknown as vi.Mock;
  const createFolder = objectService.createFolder as unknown as vi.Mock;

  beforeEach(() => {
    fetchChildren.mockReset();
    createFolder.mockReset();
  });

  it("loads folders and creates new folder", async () => {
    fetchChildren.mockResolvedValueOnce([
      { key: "docs/", parent: "", isFolder: 1 },
    ]);
    const onClose = vi.fn();
    const onCreated = vi.fn();
    render(
      <CreateFolderDialog
        open
        connection={connection}
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    await screen.findByText("docs");
    await userEvent.click(screen.getByText("/"));
    const input = screen.getByLabelText("Folder name") as HTMLInputElement;
    expect(input.disabled).toBe(false);
    await userEvent.type(input, "new");
    await userEvent.click(screen.getByRole("button", { name: "Crea" }));

    await waitFor(() =>
      expect(createFolder).toHaveBeenCalledWith(connection, "new/")
    );
    expect(onCreated).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
