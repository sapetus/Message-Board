import React from 'react'
import {
  Routes,
  Route,
  Link
} from 'react-router-dom'

import LandingPage from './LandingPage/LandingPage';
import DiscussionPage from './DiscussionPage/DiscussionPage';

const App = () => {

  return (
    <div id="main">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path={`/discussion/:name`} element={<DiscussionPage />} />
        <Route path="*" element={
          <div>
            <p>Are you lost?</p>
          </div>
        }/>
      </Routes>
    </div>
  )
}

export default App;