/* eslint-disable node/no-unpublished-import */
import {Configuration} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const config: Configuration = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
  },
  plugins: [new HtmlWebpackPlugin()],
};

export default config;
