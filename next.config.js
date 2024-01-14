/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // webpack: (config, { isServer }) => {
  //   config.module.rules.push({
  //     test: /\.(woff2|woff|ttf|eot)$/,
  //     use: {
  //       loader: 'file-loader',
  //       options: {
  //         name: '[name].[ext]',
  //         publicPath: '/_next/static/fonts',
  //         outputPath: 'static/fonts',
  //       },
  //     },
  //   });

  //   return config;
  // }

}

module.exports = nextConfig
