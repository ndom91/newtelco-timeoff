import React from 'react'
import App from 'next/app'
import Head from 'next/head'
// const LogRocket = require('logrocket')
// const Sentry = require('@sentry/browser')

export default class MyApp extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    // if (process.browser && pageProps.session && pageProps.session.user) {
    //   LogRocket.init('ui2vht/next-maintenance')
    //   LogRocket.identify(pageProps.session.user.id, {
    //     name: pageProps.session.user.name,
    //     email: pageProps.session.user.email
    //   })
    //   Sentry.init({ dsn: 'https://627b5da84c4944f4acc2118b47dad88e@sentry.ndo.dev/3' })
    //   LogRocket.getSessionURL(sessionURL => {
    //     Sentry.configureScope(scope => {
    //       scope.setExtra('sessionURL', sessionURL)
    //     })
    //   })
    // }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <>
        <Head>
          <title>Newtelco Time-Off</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/favicon/apple-touch-icon.png' />
          <link rel='mask-icon' href='/static/images/favicon/safari-pinned-tab.svg' color='#5bbad5' />
          <meta name='msapplication-TileColor' content='#603cba' />
          <meta name='theme-color' content='#ffffff' />
          <meta name='application-name' content='Newtelco Time-Off' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content='Newtelco Time-Off' />
          <meta name='description' content='Newtelco Time-Off Management' />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='msapplication-TileColor' content='#2B5797' />
          <meta name='msapplication-tap-highlight' content='no' />
          <meta name='theme-color' content='#000000' />
          <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/favicon/apple-touch-icon.png' />
          <link rel='manifest' href='/manifest.json' />
          <link rel='mask-icon' href='/static/icons/safari-pinned-tab.svg' color='#5bbad5' />
          <link rel='shortcut icon' id='favicon' href='/static/images/favicon/favicon.ico' />
        </Head>
        <Component {...pageProps} />
        <style jsx global>{`
          body,
          .container,
          .container-fluid,
          .row {
            background: none;
          }
        `}
        </style>
      </>
    )
  }
}
