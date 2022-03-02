module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: 66,
          firefox: 60,
          edge: 42,
          safari: 12,
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        useBuiltIns: true,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-async-to-generator',
    // '@babel/plugin-transform-classes',
    '@babel/proposal-object-rest-spread',
  ]
}