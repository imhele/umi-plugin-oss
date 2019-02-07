// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
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
          exclude: [/components/],
        },
      },
    ],
    [
      'umi-plugin-oss',
      {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        ignore: {
          fileSizeBetween: [[0, 800]],
        },
        acl: {
          publicRead: new RegExp('.js'),
          else: 'private',
        },
        bucket: {
          endpoint: 'your.endpoint.com',
        },
      },
    ],
  ],
};
