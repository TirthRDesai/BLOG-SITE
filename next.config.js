/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null

const nextConfig = {
  reactStrictMode: true,

  images: {

    domains: ['media.gcflearnfree.org', 'images.unsplash.com', "www.zdnet.com", "www.google.com"],
    // Public Supabase Storage URLs (avatars + post images)
    remotePatterns: supabaseUrl ? [{
      protocol: supabaseUrl.protocol.replace(':', ''),
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: '/storage/v1/object/public/**',
    }] : [],
  },
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
