import React from 'react'
import { Link } from 'react-router-dom'

const navBar = () => {
  return (
    <div>
        <Link to='/login'>Login Page</Link>
        <br/>
        <Link to='/'>Home Page</Link>
    </div>
  )
}

export default navBar