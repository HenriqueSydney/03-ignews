import { signIn, useSession } from 'next-auth/react'
import styles from './styles.module.scss'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'
import { useRouter } from 'next/router'

export function SubscribeButton() {
  const { data: session } = useSession()
  const router = useRouter()
  async function handleSubscribe() {
    if (!session) {
      signIn('github')
    }

    if (session?.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe?.redirectToCheckout({ sessionId: sessionId.id })
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        console.log('Unexpected error', error)
      }
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}
