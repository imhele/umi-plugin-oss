// ref: https://umijs.org/config/
export default {
  oss: {
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
};
