import React from 'react'

const NavBar = (props) => {
  return (
    <div id="navBar">
      <button onClick={() => props.setPage('landingPage')}>Landing Page</button>
      <button onClick={() => props.setPage('logIn')}>Log In</button>
      <button onClick={() => props.setPage('signIn')}>Sign In</button>
    </div>
  )
}

export default NavBar