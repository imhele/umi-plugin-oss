import 'jest';
import { FileInfo } from '../src/syncFiles';
import UmiPluginOss, { handleAcl, UmiApi } from '../src/index';

jest.mock('fs');
jest.mock('path');
jest.mock('ali-oss');

export let messageQueue: Map<string, string[]> = new Map();

export const umiApi: UmiApi = {
  config: {
    base: undefined,
    publicPath: 'https://cdn.imhele.com/',
    cssPublicPath: undefined,
  },
  debugMode: true,
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
      messageQueue.set(`${Date.now()}|success`, messages);
    },
    error: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}|error`, messages);
    },
    debug: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}|debug`, messages);
    },
    pending: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}|pending`, messages);
    },
    watch: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}|watch`, messages);
    },
  },
  debug: (message: string) => {
    messageQueue.set(`${Date.now()}|debug`, [message]);
  },
  onBuildSuccess: (callback) => { callback(); },
};

describe('test index', () => {
  test('api exist', () => {
    expect(UmiPluginOss).toBeTruthy();
    expect(handleAcl).toBeTruthy();
  });

  test('handleAcl', () => {
    const fileInfoArr: FileInfo[] = [
      ['umi.js', '/home/umi.js', 'private'],
      ['test.js', '/home/test.js', 'private'],
    ];
    expect(() => {
      handleAcl(['test.js'], fileInfoArr, 'public-read');
    }).not.toThrow();
    expect(fileInfoArr[1][2]).toBe('public-read');
  });

  test('UmiPluginOss without params', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi, {});
    }).toThrow();
    expect(messageQueue.size).toBe(0);
  });

  test('UmiPluginOss with default options', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('The following files will be uploaded to cdn.imhele.com/:\n'
      + 'umi.js    private\n'
      + 'static/image.png    private');
  });

  test('UmiPluginOss without cname and bucket', () => {
    messageQueue.clear();
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
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('error')).toBe(true);
  });

  test('UmiPluginOss with bucket', () => {
    messageQueue.clear();
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
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('The following files will be uploaded to imhele/:\n'
      + 'umi.js    private\n'
      + 'static/image.png    private');
  });

  test('UmiPluginOss with RegExp acl rule', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        acl: {
          publicRead: new RegExp('.js'),
        },
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('The following files will be uploaded to cdn.imhele.com/:\n'
      + 'umi.js    public-read\n'
      + 'static/image.png    private');
  });

  test('UmiPluginOss with ignore filter', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        ignore: {
          extname: ['.html'],
          sizeBetween: [[0, 1000]],
        },
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('There is nothing need to upload.');
  });

  test('UmiPluginOss with bijection', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bijection: true,
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('The following files will be uploaded to cdn.imhele.com/:\n'
      + 'umi.js    private\n'
      + 'static/image.png    private');
  });

  test('UmiPluginOss without debugMode', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(
        {
          ...umiApi,
          debugMode: false,
        },
        {
          accessKeyId: 'test',
          accessKeySecret: 'test',
          bijection: true,
        },
      );
    }).not.toThrow();
  });

});
