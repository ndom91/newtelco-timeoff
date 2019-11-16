import React from 'react'
import Link from 'next/link'

export default class RequireLogin extends React.Component {
  render () {
    return (
      <div className='require-login-wrapper'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 mr-auto ml-auto'>
              <div className='card card-outline mt-3 mb-3'>
                <h4 className='card-header text-error'>Error!</h4>
                <div className='card-body pb-0'>
                  <p>
                      You must be signed-in to view this content.
                  </p>
                  <p className='text-right'>
                    <Link href='/auth'>
                      <button id='signin-btn' type='submit' className='btn btn-outline-success'>Sign in</button>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .card-outline {
            border: 3px solid rgba(244,10,10,0.3);
            box-shadow: 0 0 10px 1px rgba(244,10,10,0.3);
          }
          .require-login-wrapper {
            display: flex;
            align-content: center;
          }
          .require-login-wrapper > div {
            margin-top: 20px;
            font-family: Lato, Helvetica;
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
