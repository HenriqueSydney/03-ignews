import Image from 'next/image'
import styles from './styles.module.scss'

import { SingInButton } from '../SignInButton'
import { ActiveLink } from '../ActiveLink'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image
          src={'/images/logo.svg' as any}
          alt="ignews"
          width={100}
          height={100}
        />
        <nav>
          <ActiveLink
            href="/"
            linkTitle="Home"
            activeClassName={styles.active}
          />
          <ActiveLink
            href="/posts"
            linkTitle="Posts"
            activeClassName={styles.active}
          />
        </nav>

        <SingInButton />
      </div>
    </header>
  )
}
