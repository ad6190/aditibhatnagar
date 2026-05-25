import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Layout } from '../components/Layout'

describe('Layout footer', () => {
  it('renders a semantic footer element', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    // <footer> has the implicit ARIA role "contentinfo"
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays the copyright symbol and current year', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    const year = new Date().getFullYear().toString()
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(`© ${year} aditi.`)
  })

  it('displays the tagline', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('obsidian + react')
  })

  it('year in footer is dynamic (matches current year at test runtime)', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    const footer = screen.getByRole('contentinfo')
    const currentYear = new Date().getFullYear()
    // Verify the footer text contains a year that matches new Date().getFullYear()
    expect(footer.textContent).toContain(String(currentYear))
  })
})
