import { render, screen } from '@testing-library/react'
import { ActiveLink } from '.'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/',
      }
    },
  }
})

describe('Active Link component', () => {
  it('should renders correctly', () => {
    render(<ActiveLink href="/" linkTitle="Home" activeClassName="active" />)

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('should add active class if the link is currently active', () => {
    render(<ActiveLink href="/" linkTitle="Home" activeClassName="active" />)

    expect(screen.getByText('Home')).toHaveClass('active')
  })
})
