import 'jest';
import { FileInfo, wait } from '../src/syncFiles';
import { IOnBuildSuccessFunc } from 'umi-plugin-types';
import UmiPluginOss, { handleAcl } from '../src/index';

jest.mock('fs');
jest.mock('path');
jest.mock('ali-oss');
jest.mock('syncFiles');

export let messageQueue: Map<string, string[]> = new Map();

export const umiApi = {
  paths: {
    outputPath: '/dist/',
    absOutputPath: '/home/dist/',
  },
  registerCommand: () => {},
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
  onBuildSuccess: (callback: IOnBuildSuccessFunc) => {
    callback(undefined);
  },
};

describe('test index', () => {
  test('api exist', () => {
    expect(UmiPluginOss).toBeTruthy();
    expect(handleAcl).toBeTruthy();
  });

  test('handleAcl', () => {
    const fileInfoArr: FileInfo[] = [['umi.js', '/home/umi.js', 'private'], ['test.js', '/home/test.js', 'private']];
    expect(() => {
      handleAcl(['test.js'], fileInfoArr, 'public-read');
    }).not.toThrow();
    expect(fileInfoArr[1][2]).toBe('public-read');
  });

  test('UmiPluginOss without accessKey', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        bucket: {
          name: 'test',
          region: 'oss-cn-beijing',
        },
      });
    }).toThrow();
    expect(messageQueue.size).toBe(0);
  });

  test('UmiPluginOss with default options', async () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: {
          name: 'test',
          region: 'oss-cn-beijing',
        },
      });
    }).not.toThrow();
    await wait(0.1);
    expect(messageQueue.size).toBe(6);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0].includes('umi.js')).toBe(true);
  });

  test('UmiPluginOss without bucket configuration', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { region: 'oss-cn-beijing' },
      });
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { name: 'test' },
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(2);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('error')).toBe(true);
  });

  test('UmiPluginOss with RegExp acl rule', async () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { endpoint: 'oss-cn-beijing.example.com' },
        acl: { publicRead: new RegExp('.js') },
      });
    }).not.toThrow();
    await wait(0.1);
    expect(messageQueue.size).toBe(6);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0].includes('...')).toBe(true);
    expect(messageQueue.get(keys[0])[0].includes('public-read')).toBe(true);
  });

  test('UmiPluginOss with ignore filter', () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { endpoint: 'oss-cn-beijing.example.com' },
        ignore: {
          extname: ['.html'],
          sizeBetween: [[0, 1000]],
        },
      });
    }).not.toThrow();
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('There is nothing need to be uploaded.\n');
  });

  test('UmiPluginOss with bijection', async () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { endpoint: 'oss-cn-beijing.example.com' },
        bijection: true,
      });
    }).not.toThrow();
    await wait(0.1);
    expect(messageQueue.size).toBe(7);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
    expect(keys[1].endsWith('success')).toBe(true);
    expect(messageQueue.get(keys[0])[0]).toBe('There is nothing need to be deleted.\n');
    expect(messageQueue.get(keys[1])[0].includes('umi.js')).toBe(true);
  });

  test('UmiPluginOss with ignore existsInOss', async () => {
    messageQueue.clear();
    expect(() => {
      UmiPluginOss(umiApi as any, {
        accessKeyId: 'test',
        accessKeySecret: 'test',
        bucket: { endpoint: 'oss-cn-beijing.example.com' },
        ignore: { existsInOss: true },
      });
    }).not.toThrow();
    await wait(0.1);
    expect(messageQueue.size).toBe(1);
    const keys = Array.from(messageQueue.keys());
    expect(keys[0].endsWith('success')).toBe(true);
  });
});
