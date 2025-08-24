import { render, screen } from "@testing-library/react";
import ConnectionDetails from "./ConnectionDetails";
import type { S3Connection } from "../types/s3";

describe("ConnectionDetails", () => {
  const base: S3Connection = {
    id: "1",
    displayName: "Test",
    environment: "dev",
    endpoint: "https://example.com",
    bucketName: "bucket",
    accessKeyId: "",
    secretAccessKey: "",
    pathStyle: 1,
    isActive: 1,
    testStatus: "success",
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };

  it("shows optional fields when provided", () => {
    const conn = { ...base, region: "us-east-1", lastTested: new Date("2023-01-01T00:00:00Z") };
    render(<ConnectionDetails connection={conn} />);

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("bucket")).toBeInTheDocument();
    expect(screen.getByText("us-east-1")).toBeInTheDocument();
    expect(screen.getByText("Attiva")).toBeInTheDocument();
    expect(screen.getByText("Connesso")).toBeInTheDocument();
  });

  it("hides region when not set", () => {
    render(<ConnectionDetails connection={base} />);
    expect(screen.queryByText("Regione")).not.toBeInTheDocument();
    expect(screen.getByText("Mai")).toBeInTheDocument();
  });
});
