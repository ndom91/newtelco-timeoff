import React from 'react'

class Wrapper extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      dummy: true
    }
  }

  render () {
    return (
      <div className='app-wrapper'>
        TEXT!
      </div>
    ) 
  }
}

export default Wrapper
