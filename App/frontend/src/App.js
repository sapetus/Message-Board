import React, { useState } from 'react'

import NavBar from './NavBar/NavBar';
import LandingPage from './LandingPage/LandingPage';

const App = () => {
  const [page, setPage] = useState()

  return (
    <div id="main">
      <NavBar setPage={setPage} />
      <LandingPage
        show={page === 'landingPage'}
      />
    </div>
  )
}

export default App;