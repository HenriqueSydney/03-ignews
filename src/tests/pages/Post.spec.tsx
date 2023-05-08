import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { render, screen } from '@testing-library/react'
import { getPrismicClient } from '../../services/prismic'
import { getSession } from 'next-auth/react'

jest.mock('next-auth/react')
jest.mock('../../services/prismic')
const post = {
  slug: 'my-new-post',
  title: 'My New Post',
  content: '<p>This is my new post</p>',
  updatedAt: '10 de abril',
}

describe('Post page', () => {
  it('should renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
    expect(screen.getByText('This is my new post')).toBeInTheDocument()
  })

  it('should redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      }),
    )
  })

  it('should loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession)

    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'This is my new post' }],
          content: [{ type: 'paragraph', text: 'Post content', spans: [] }],
        },
        last_publication_date: '04-01-2021',
      }),
    } as any)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any)

    const response = await getServerSideProps({
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
