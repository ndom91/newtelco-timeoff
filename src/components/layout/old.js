import React from 'react'
import NavBar from '.'
import { Button, FlexboxGrid, Container, Sidebar, Header, Content, Footer } from 'rsuite'
import 'rsuite/lib/styles/index.less'

const Layout = (props) => {
  return (
    <div className='show-container'>
      <NavBar />
    </div>
  )
}

export default Layout
