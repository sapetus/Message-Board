import React from 'react'

const Modal = ({ text, setMessage }) => {
  return (
    <div className="modal">
      <div className="modalContent">
        <i className="material-icons close" onClick={() => setMessage(null)}>close</i>
        <h3>{text}</h3>
      </div>
    </div>
  )
}

export default Modal