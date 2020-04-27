module.exports = function override(config, env) {
  //do stuff with the webpack config...
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
  return config;
};
