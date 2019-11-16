const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const dev = process.env.NODE_ENV !== 'production'
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
require('dotenv').config()
const path = require('path')
const Dotenv = require('dotenv-webpack')
const withPWA = require('next-pwa')

function HACK_removeMinimizeOptionFromCssLoaders (config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  )
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize
        }
      })
    }
  })
}

const nextConfig = {
  target: 'server',
  compress: false,
  pwa: {
    disable: dev,
    dest: 'public',
    register: true,
    scope: '/',
    sw: 'sw.js',
    clientsClaim: true,
    skipWaiting: true,
    modifyURLPrefix: {
      '.next': '/_next'
    },
    runtimeCaching: [{
      urlPattern: /api/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-api',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 60
        }
      }
    }, {
      urlPattern: /^https:\/\/api\.maintenance.newtelco.de\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 60
        }
      }
    }, {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    }, {
      urlPattern: /^https:\/\/use\.fontawesome\.com\/releases\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-awesome',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    }, {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    }, {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }, {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }, {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }, {
      urlPattern: /.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }]
  },
  exportPathMap: function () {
    return {
      '/': { page: '/' }
    }
  },
  webpack (config, { isServer, buildId, dev }) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    HACK_removeMinimizeOptionFromCssLoaders(config)
    config.stats = { warningsFilter: warn => warn.indexOf('Conflicting order between:') > -1 }
    // eslint-disable-next-line
    new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: true
    })
    return config
  }
}

module.exports = withPWA(withCSS(nextConfig))
