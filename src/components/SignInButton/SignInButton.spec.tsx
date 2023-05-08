import { SingInButton } from '.'
import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react')

/*
jest.mock("next-auth/react", () => {
  const originalModule = jest.requireActual('next-auth/react');
 
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => {
      return {data: mockSession, status: 'authenticated'}  // return type is [] in v3 but changed to {} in v4
    }),
  };
});

*/

describe('SingInButton component', () => {
  it('should renders correctly when user not authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    })

    render(<SingInButton />)

    expect(screen.getByText('Sign In with Github')).toBeInTheDocument()
  })

  it('should renders correctly when user is authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: { user: { name: 'John Doe', email: 'john.doe@exemple.com' } },
      status: 'authenticated',
    })

    render(<SingInButton />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
