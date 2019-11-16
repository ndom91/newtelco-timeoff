import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import "shards-ui/dist/css/shards.min.css"
import Layout from  '../components/layout/index'
import RequireLogin from '../components/requiredLogin'

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
        <>
          <Layout />
          <div className='app-wrapper'>
            TEXT!
          </div>
        </>
      ) 
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
