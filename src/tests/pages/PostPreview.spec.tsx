import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { render, screen } from '@testing-library/react'
import { getPrismicClient } from '../../services/prismic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}))

jest.mock('../../services/prismic')
const post = {
  slug: 'my-new-post',
  title: 'My New Post',
  content: '<p>This is my new post</p>',
  updatedAt: '10 de abril',
}

jest.mock('next-auth/react')

describe('Post preview page', () => {
  it('should renders correctly', () => {
    ;(useSession as jest.Mock).mockReturnValueOnce({
      data: {
        user: { name: 'John', email: 'john.doe@example.com' },
        expires: 'fake-expires',
        activeSubscription: null,
      },
      status: 'authenticated',
    })

    render(<Post post={post} />)

    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('should redirects user to full post when user is subscribed', async () => {
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

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any)

    render(<Post post={post} />)

    expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
  })

  it('should loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        uid: 'my-new-post',
        data: {
          title: [{ type: 'heading', text: 'This is my new post' }],
          content: [{ type: 'paragraph', text: 'Post content', spans: [] }],
        },
        last_publication_date: '04-01-2021',
      }),
    } as any)

    const response = await getStaticProps({
      params: { slug: 'my-new-post' },
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'This is my new post',
            content: '<p>Post content</p>',
            updatedAt: '01 de abril de 2021',
          },
        },
      }),
    )
  })
})
