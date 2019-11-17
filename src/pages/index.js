import React from 'react'
import Layout from '../components/layout/index'
import RequireLogin from '../components/requiredLogin'
import { Button, FlexboxGrid, Container, Sidebar, Header, Content, Footer } from 'rsuite'
// import { faSearch } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import Link from 'next/link'

class Wrapper extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      dummy: true
    }
  }

  render () {
    // if (this.props.session.user) {
    if (this.props) {
      return (
        <Layout>
          <Header>
            <h2>Page Title</h2>
          </Header>
          <Content>Content</Content>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
