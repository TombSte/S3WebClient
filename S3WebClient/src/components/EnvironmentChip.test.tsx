import { render, screen } from '@testing-library/react';
import EnvironmentChip from './EnvironmentChip';

describe('EnvironmentChip', () => {
  it('uses error color for prod', () => {
    render(<EnvironmentChip environment="prod" />);
    const chip = screen.getByText('PROD').closest('.MuiChip-root');
    expect(chip?.className).toMatch(/MuiChip-colorError/);
  });

  it('uses warning color for test', () => {
    render(<EnvironmentChip environment="test" />);
    const chip = screen.getByText('TEST').closest('.MuiChip-root');
    expect(chip?.className).toMatch(/MuiChip-colorWarning/);
  });

  it('uses success color for dev', () => {
    render(<EnvironmentChip environment="dev" />);
    const chip = screen.getByText('DEV').closest('.MuiChip-root');
    expect(chip?.className).toMatch(/MuiChip-colorSuccess/);
  });

  it('defaults to info color for custom', () => {
    render(<EnvironmentChip environment="custom" />);
    const chip = screen.getByText('CUSTOM').closest('.MuiChip-root');
    expect(chip?.className).toMatch(/MuiChip-colorInfo/);
  });
});
