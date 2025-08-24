import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";
import { useState } from "react";

describe("SearchBar", () => {
  it("calls onChange and onSearch", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    function Wrapper() {
      const [val, setVal] = useState("");
      return (
        <SearchBar
          value={val}
          onChange={(v) => {
            setVal(v);
            onChange(v);
          }}
          onSearch={onSearch}
          suggestions={[]}
        />
      );
    }
    render(<Wrapper />);

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "test");
    expect(onChange).toHaveBeenLastCalledWith("test");
    await userEvent.type(input, "{enter}");
    expect(onSearch).toHaveBeenCalledWith("test");
  });

  it("clears value with button", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <SearchBar value="abc" onChange={onChange} onSearch={onSearch} />
    );

    const clearButton = screen.getAllByRole("button")[0];
    await userEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith("");
    expect(onSearch).toHaveBeenCalledWith("");
  });
});
