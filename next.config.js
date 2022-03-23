const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { withSentryConfig } = require("@sentry/nextjs")

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  compress: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  maximumFileSizeToCacheInBytes: 5242880,
  webpack(config) {
    config.module.rules.push({
      test: /\.(le|c)ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
        },
        {
          loader: "less-loader",
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    })

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
        chunkFilename: "static/css/[contenthash].css",
      })
    )

    return config
  },
}

module.exports = withSentryConfig(nextConfig, SentryWebpackPluginOptions)
