
// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: false,
      dva: false,
      dynamicImport: false,
      title: 'base',
      dll: false,
      routes: {
        exclude: [],
      },
      hardSource: false,
      routes: {
        exclude: [
          /components/,
        ],
      },
    }],
    ['umi-plugin-oss', {}],
  ],
  publicPath: 'https://path.to.your.oss/dir/',
}
