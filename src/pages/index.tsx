import { GetStaticProps } from 'next'

import Head from 'next/head'
import Image from 'next/image'

import styles from './home.module.scss'

import { stripe } from '../services/stripe'

import { SubscribeButton } from '../components/SubscribeButton'

interface HomeProps {
  product: {
    priceId: string
    amount: string
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ignews</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>from {product.amount} month</span>
          </p>

          <SubscribeButton />
        </section>
        <Image
          src="/images/avatar.svg"
          alt="Girl Coding"
          width={334}
          height={520}
        />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1My4paG5YRsTv6ItR12WyjUS')
  // deploy test
  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount! / 100),
  }

  const twentyFourHours = 60 * 60 * 24

  return {
    props: {
      product,
    },
    revalidate: twentyFourHours,
  }
}
