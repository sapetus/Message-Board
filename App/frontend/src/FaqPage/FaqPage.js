import React from 'react'

const FaqPage = () => {
  return (
    <div id="page">
      <h1 style={{ marginBottom: "0px" }}>FAQ</h1>
      <p className='dividerHorizontal' />
      <ul>
        <li>
          <h1>How does this work?</h1>
          <p>
            You can create an account from the 'Register' -button at the top of this page.
            <br /><br />
            From 'Home' -button, you can browse different discussions, but if none suit your
            interest, you can create your own.
            <br /><br />
            You can create posts in any discussion you'd like, but try to keep the topic relevant to that discussion.
            <br /><br />
            Each post and comment can be liked or disliked. You can find your own total in your profile by pressing
            the 'Profile' -button at the top of the page
          </p>
        </li>
        <p className="dividerHorizontal" />
        <li>
          <h1>What is this page?</h1>
          <p>This page was created as a student project by Sampo Pitkänen for Full Stack open 2021.</p>
        </li>
      </ul>
    </div >
  )
}

export default FaqPage