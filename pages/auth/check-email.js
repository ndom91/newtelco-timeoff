import React from 'react'
import Link from 'next/link'

export default class extends React.Component {
  static async getInitialProps ({ query }) {
    return {
      email: query.email
    }
  }

  render () {
    return (
      <div className='require-login-wrapper'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 mr-auto ml-auto'>
              <div className='card mt-3 mb-3'>
                <h4 className='card-header text-error'>Check your email</h4>
                <div className='card-body pb-0'>
                  <p>
                    A sign in link has been sent to {(this.props.email) ? <span className='font-weight-bold'>{this.props.email}</span> : <span>your inbox</span>}.
                  </p>
                  <p className='text-right'>
                    <Link href='/'>
                      <button id='signin-btn' type='submit' className='btn btn-outline-success'>Home</button>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .require-login-wrapper {
            display: flex;
            align-content: center;
          }
          .require-login-wrapper > div {
            margin-top: 20px;
            font-family: Poppins, Helvetica;
            font-weight: 300;
          }
          #signin-btn {
            margin-bottom: 20px;
          }
        `}
        </style>
      </div>
    )
  }
}
