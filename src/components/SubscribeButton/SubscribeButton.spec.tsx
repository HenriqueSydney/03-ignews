import { fireEvent, render, screen } from '@testing-library/react'

import { signIn, useSession } from 'next-auth/react'

import { SubscribeButton } from '.'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}))

jest.mock('next-auth/react')

describe('SubscribeButton component', () => {
  it('should renders correctly', () => {
    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: null,
      status: 'loading',
    })

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('should redirects user to sign in when not authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: null,
      status: 'loading',
    })
    const signInMocked = jest.mocked(signIn)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('should redirects to posts when user already has a subscription', () => {
    const useRouterMocked = jest.mocked(useRouter)
    const pushMocked = jest.fn()

    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: {
        user: { name: 'John', email: 'john.doe@example.com' },
        expires: 'fake-expires',
        activeSubscription: 'fake-active-subscription',
      },
      status: 'authenticated',
    })

    // quando essa função for chamado, o retorno dela deve ser
    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalled()
  })
})
