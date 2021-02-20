const rewireCss = require('react-app-rewire-postcss');
module.exports = function override(config, env) {
  // webpack config...
  config = rewireCss(config, true);

  config.externals = {
    nodegit: "commonjs nodegit",
  };
  config.module.rules.push({
    test: /\.(png|jp(e*)g|svg|gif)$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name: "images/[hash]-[name].[ext]",
        },
      },
    ],
  });
  if (env === "production") {
    config.output.publicPath = './';
  }
  return config;
};
