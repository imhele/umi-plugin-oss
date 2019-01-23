import 'jest';
import { IOnBuildSuccessFunc } from 'umi-plugin-types';
import { FileInfo } from '../src/syncFiles';
import UmiPluginOss, { handleAcl } from '../src/index';

jest.mock('fs');
jest.mock('path');
jest.mock('ali-oss');
jest.mock('syncFiles');

export let messageQueue: Map<string, string[]> = new Map();

export const umiApi = {
  config: {
    publicPath: 'https://cdn.imhele.com/',
  },
  paths: {
    outputPath: '/dist/',
    absOutputPath: '/home/dist/',
  },
  registerCommand: () => { },
  log: {
    success: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|success`, messages);
    },
    error: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|error`, messages);
    },
    pending: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|pending`, messages);
    },
  },
  debug: (message: string) => {
    messageQueue.set(`${Date.now()}.${Math.random()}|debug`, [message]);
  },
  onBuildSuccess: (callback: IOnBuildSuccessFunc) => { callback(undefined); },
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
      UmiPluginOss(umiApi as any, {});
    }).toThrow();
    expect(messageQueue.size).toBe(0);
  });

  test('UmiPluginOss with default options', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
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
        } as any,
        {
          accessKeyId: 'test',
          accessKeySecret: 'test',
        },
      );
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
        } as any,
        {
          accessKeyId: 'test',
          accessKeySecret: 'test',
          bucket: {
            name: 'imhele',
            region: 'oss-cn-beijing',
          },
        },
      );
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
      UmiPluginOss(umiApi as any, {
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
      UmiPluginOss(umiApi as any, {
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
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bijection: true,
      });
    }).not.toThrow();
    setTimeout(() => {
      expect(messageQueue.size).toBe(1);
      const keys = Array.from(messageQueue.keys());
      expect(keys[0].endsWith('success')).toBe(true);
      expect(messageQueue.get(keys[0])[0]).toBe('The following files will be uploaded to cdn.imhele.com/:\n'
        + 'umi.js    private\n'
        + 'static/image.png    private');
    }, 10);
  });

  test('UmiPluginOss with ignore existsInOss', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        ignore: {
          existsInOss: true,
        },
      });
    }).not.toThrow();
    setTimeout(() => {
      expect(messageQueue.size).toBe(1);
      const keys = Array.from(messageQueue.keys());
      expect(keys[0].endsWith('success')).toBe(true);
    }, 10);
  });
});
