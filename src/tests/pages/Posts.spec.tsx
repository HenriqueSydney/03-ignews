import Posts, { getStaticProps } from '../../pages/posts'
import { render, screen } from '@testing-library/react'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')

const posts = [
  {
    slug: 'my-new-post',
    title: 'My New Post',
    excerpt: 'This is my new post',
    updatedAt: '10 de abril',
  },
]

describe('Posts page', () => {
  it('should renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
  })

  it('should loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByType: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [{ type: 'heading', text: 'This is my new post' }],
              content: [{ type: 'paragraph', text: 'Post excerpt' }],
            },
            last_publication_date: '04-01-2021',
          },
        ],
      }),
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'This is my new post',
              excerpt: 'Post excerpt',
              updatedAt: '01 de abril de 2021',
            },
          ],
        },
      }),
    )
  })
})
