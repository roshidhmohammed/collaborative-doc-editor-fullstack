import { render, screen } from '@testing-library/react';
import FormField from '@/shared/components/FormField';

describe('FormField', () => {
  it('renders the label and children and applies required indicator', () => {
    render(
      <FormField label="Name" htmlFor="name" required>
        <input id="name" />
      </FormField>,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not render the required asterisk when required=false', () => {
    render(
      <FormField label="Name" htmlFor="name" required={false}>
        <input id="name" />
      </FormField>,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});
