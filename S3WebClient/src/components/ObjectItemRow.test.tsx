import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ObjectItemRow from "./ObjectItemRow";
import type { S3ObjectEntity } from "../types/s3";

describe("ObjectItemRow", () => {
  const file: S3ObjectEntity = {
    connectionId: "c",
    key: "file.txt",
    parent: "",
    isFolder: 0,
    size: 100,
    lastModified: new Date("2023-01-01T00:00:00Z"),
  };

  const folder: S3ObjectEntity = {
    connectionId: "c",
    key: "folder/",
    parent: "",
    isFolder: 1,
  };

  it("shows move action only for files", async () => {
    const onMove = vi.fn();
    render(<ObjectItemRow item={file} name="file.txt" onMove={onMove} />);
    const menuButton = screen.getAllByRole("button")[1];
    await userEvent.click(menuButton);
    expect(await screen.findByText("Sposta")).toBeInTheDocument();
  });

  it("hides move action for folders", async () => {
    render(<ObjectItemRow item={folder} name="folder" onMove={vi.fn()} />);
    const menuButton = screen.getAllByRole("button")[1];
    await userEvent.click(menuButton);
    expect(screen.queryByText("Sposta")).not.toBeInTheDocument();
  });
});
