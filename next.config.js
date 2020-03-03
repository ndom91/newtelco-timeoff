// const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
// const dev = process.env.NODE_ENV !== 'production'
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
const withLess = require('@zeit/next-less')
// require('dotenv').config()
const path = require('path')
// const Dotenv = require('dotenv-webpack')

// eslint-disable-next-line
function HACK_removeMinimizeOptionFromCssLoaders(config) {
  // console.warn(
  //   'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  // )
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
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  // exportPathMap: function () {
  //   return {
  //     '/': { page: '/' }
  //   }
  // },
  webpack (config, { isServer, buildId, dev }) {
    // config.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    HACK_removeMinimizeOptionFromCssLoaders(config)
    config.stats = { warningsFilter: warn => warn.indexOf('Conflicting order between:') > -1 }
    // eslint-disable-next-line
    // new Dotenv({
    // path: path.join(__dirname, '.env'),
    // systemvars: true
    // })
    return config
  }
}

module.exports = withImages(withLess(withCSS(nextConfig)))
