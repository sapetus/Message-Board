import React from 'react'

const LandingPage = (props) => {
  if (!props.show) {
    return null
  }

  return (
    <div id="landingPage">
      <h1>Landing Page</h1>
    </div>
  )
}

export default LandingPage