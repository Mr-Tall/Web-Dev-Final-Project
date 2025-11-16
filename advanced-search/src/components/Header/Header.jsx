import React from 'react'
import SearchForm from '../SearchForm/SearchForm'
import UserNav from '../UserNav/UserNav'
import styles from './Header.module.css'

const Header = ({ cartCount, onSearch }) => {
  return (
    <header className={styles.mainHeader}>
      <div className={styles.headerContainer}>
        <div className={styles.logoSection}>
          <h1 className={styles.logoText}>WEBAPPNAME</h1>
        </div>
        <SearchForm onSearch={onSearch} />
        <UserNav cartCount={cartCount} />
      </div>
    </header>
  )
}

export default Header

