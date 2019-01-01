import 'jest';
import UmiPluginOss, { handleAcl, FileInfo, UmiApi } from '../src/index';

jest.mock('fs');

const umiApi: UmiApi = {
  config: {
    base: undefined,
    publicPath: 'https://cdn.imhele.com/',
    cssPublicPath: undefined,
  },
  paths: {
    outputPath: '/dist/',
    absOutputPath: '/home/dist/',
    pagesPath: '',
    absPagesPath: '',
    tmpDirPath: '',
    absTmpDirPath: '',
    absSrcPath: '',
    cwd: '',
  },
  routes: [],
  registerCommand: () => { },
  log: {
    success: (...messages: string[]) => {
      console.log(`success:\n${JSON.stringify(messages)}`);
    },
    error: (...messages: string[]) => {
      console.log(`error:\n${JSON.stringify(messages)}`);
    },
    debug: (...messages: string[]) => {
      console.log(`debug:\n${JSON.stringify(messages)}`);
    },
    pending: (...messages: string[]) => {
      console.log(`pending:\n${JSON.stringify(messages)}`);
    },
    watch: (...messages: string[]) => {
      console.log(`watch:\n${JSON.stringify(messages)}`);
    },
  },
  debug: (message: string) => {
    console.log(`debug:\n${message}`);
  },
  onBuildSuccess: (callback) => { callback(); },
};

describe('test index', () => {
  test('api exist', () => {
    expect(UmiPluginOss).toBeTruthy();
    expect(handleAcl).toBeTruthy();
  });

  test('handleAcl', () => {
    const fileInfoArr: FileInfo[] = [['test.js', '/home/test.js', 'private']];
    expect(() => {
      handleAcl(['test.js'], fileInfoArr, 'public-read');
    }).not.toThrow();
    expect(fileInfoArr[0][2]).toBe('public-read');
  });

  test('UmiPluginOss without params', () => {
    expect(() => {
      UmiPluginOss(umiApi, {});
    }).toThrow();
  });

  test('UmiPluginOss with default options', () => {
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
      });
    }).not.toThrow();
  });

  test('UmiPluginOss without cname and bucket', () => {
    expect(() => {
      UmiPluginOss(
        {
          ...umiApi,
          config: {
            ...umiApi.config,
            publicPath: undefined,
          },
        },
        {
          accessKeyId: 'test',
          accessKeySecret: 'test',
        });
    }).toThrow();
  });

  test('UmiPluginOss with bucket', () => {
    expect(() => {
      UmiPluginOss(
        {
          ...umiApi,
          config: {
            ...umiApi.config,
            publicPath: undefined,
          },
        },
        {
          accessKeyId: 'test',
          accessKeySecret: 'test',
          bucket: {
            name: 'imhele',
            region: 'oss-cn-beijing',
          },
        });
    }).not.toThrow();
  });

  test('UmiPluginOss with RegExp acl rule', () => {
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        acl: {
          publicRead: new RegExp('.js'),
        },
      });
    }).not.toThrow();
  });

  test('UmiPluginOss with ignore filter', () => {
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        ignore: {
          sizeBetween: [[0, 1000]],
        },
      });
    }).not.toThrow();
  });

});
