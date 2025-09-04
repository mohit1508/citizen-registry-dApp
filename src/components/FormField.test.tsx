/**
 * FormField.test.tsx
 * Renders with and without error; verifies label and helper message.
 */
import { render, screen } from '@testing-library/react'
import FormField from './FormField'

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Name">
        <input aria-label="input" />
      </FormField>
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('input')).toBeInTheDocument()
  })

  it('shows error message when provided', () => {
    render(
      <FormField label="City" error={{ message: 'City is required' }}>
        <input aria-label="city" />
      </FormField>
    )
    expect(screen.getByText('City is required')).toBeInTheDocument()
  })
})

