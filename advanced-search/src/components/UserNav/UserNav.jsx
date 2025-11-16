import React from 'react'
import styles from './UserNav.module.css'

const UserNav = ({ cartCount }) => {
  return (
    <nav className={styles.userNav}>
      <a href="/profile" className={styles.userIconButton}>Profile</a>
      <a href="/saved" className={styles.userIconButton}>Saved</a>
      <a href="/cart" className={styles.cartButton}>
        Cart {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
      </a>
    </nav>
  )
}

export default UserNav

