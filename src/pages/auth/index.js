import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//   faGoogle
// } from '@fortawesome/free-brands-svg-icons'

export default class App extends React.Component {
  static async getInitialProps ({ req }) {
    return {
      session: await NextAuth.init({ req }),
      linkedAccounts: await NextAuth.linked({ req }),
      providers: await NextAuth.providers({ req })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      email: '',
      session: this.props.session
    }
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handleSignInSubmit = this.handleSignInSubmit.bind(this)
  }

  handleEmailChange (event) {
    this.setState({
      email: event.target.value
    })
  }

  handleSignInSubmit (event) {
    event.preventDefault()

    if (!this.state.email) return

    NextAuth.signin(this.state.email)
      .then(() => {
        Router.push(`/auth/check-email?email=${this.state.email}`)
      })
      .catch(() => {
        Router.push(`/auth/error?action=signin&type=email&email=${this.state.email}`)
      })
  }

  render () {
    if (this.props.session.user) {
      return (
        <div className='container'>
          <div className='text-center'>
            <img width='384px' src='/static/images/nt-black.png' alt='Newtelco Maintenance' />
          </div>
          <div className='row'>
            <div className='col-sm-5 mr-auto ml-auto'>
              <LinkAccounts
                session={this.props.session}
                linkedAccounts={this.props.linkedAccounts}
              />
            </div>
          </div>
          <style jsx>{`
            .text-center {
              margin: 100px 0 10px 0;
            } 
            :global(.btn) {
              margin-bottom: 10px;
            }
            :global(.btn-primary) {
              margin-bottom: 30px;
            }
          `}
          </style>
        </div>
      )
    } else {
      return (
        <div className='container'>
          <div className='text-center'>
            <img width='384px' src='/static/images/nt-black.png' alt='Newtelco Maintenance' />
          </div>
          <div className='row'>
            <div className='col-sm-6 mr-auto ml-auto'>
              <div className='card mt-3 mb-3'>
                <h4 className='card-header'>Sign In</h4>
                <div className='card-body pb-0'>
                  <SignInButtons providers={this.props.providers} />
                  <form id='signin' method='post' action='/auth/email/signin' onSubmit={this.handleSignInSubmit}>
                    <input name='_csrf' type='hidden' value={this.state.session.csrfToken} />
                    <p>
                      <label htmlFor='email'>Email address</label><br />
                      <input name='email' type='text' placeholder='jcleese@newtelco.de' id='email' className='form-control' value={this.state.email} onChange={this.handleEmailChange} />
                    </p>
                    <p className='text-right'>
                      <button id='submitButton' type='submit' style={{ width: '10rem' }} className='btn btn-outline-success'>
                        Sign in
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            .text-center {
              margin: 100px 0 50px 0;
            } 
            #email::placeholder {
              opacity: 0.4;
            }
          `}
          </style>
        </div>
      )
    }
  }
}

export class LinkAccounts extends React.Component {
  render () {
    return (
      <div className='card mt-4 mb-3'>
        <h4 className='card-header'>Link Accounts</h4>
        <div className='card-body pt-1 pb-0'>
          <p className='mt-1 mb-3'>You are signed in as <span className='font-weight-bold'>{this.props.session.user.email}</span>.</p>
          {
            Object.keys(this.props.linkedAccounts).map((provider, i) => {
              return <LinkAccount key={i} provider={provider} session={this.props.session} linked={this.props.linkedAccounts[provider]} />
            })
          }
          <Link href='/'>
            <button className='btn btn-block btn-primary' type='submit'>
                Back
            </button>
          </Link>
        </div>
      </div>
    )
  }
}

export class LinkAccount extends React.Component {
  render () {
    if (this.props.linked === true) {
      return (
        <form method='post' action={`/auth/oauth/${this.props.provider.toLowerCase()}/unlink`}>
          <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
          <button className='btn btn-block btn-outline-danger' type='submit'>
              Unlink from {this.props.provider}
          </button>
        </form>
      )
    } else {
      return (
        <p>
          <a className='btn btn-block btn-outline-primary' href={`/auth/oauth/${this.props.provider.toLowerCase()}`}>
            Link with {this.props.provider}
          </a>
        </p>
      )
    }
  }
}

export class SignInButtons extends React.Component {
  render () {
    return (
      <>
        {
          Object.keys(this.props.providers).map((provider, i) => {
            return (
              <p key={i}>
                <a className='btn btn-block btn-outline-secondary' href={this.props.providers[provider].signin}>
                  {/* <FontAwesomeIcon icon={faGoogle} width='1em' style={{ float: 'left', color: 'secondary' }} /> */}
                  Sign in with {provider}
                </a>
              </p>
            )
          })
        }
      </>
    )
  }
}
