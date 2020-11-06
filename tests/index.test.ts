import { IApi } from 'umi';
import { FileInfo, wait } from '../src/syncFiles';
import UmiPluginOss, { handleAcl } from '../src/index';

jest.mock('fs');
jest.mock('path');
jest.mock('ali-oss');

export let messageQueue: Map<string, string[]> = new Map();

export const umiApi = {
  logger: {
    success: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|success`, messages);
    },
    error: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|error`, messages);
    },
    pending: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|pending`, messages);
    },
    profile: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|pending`, messages);
    },
    log: (...messages: string[]) => {
      messageQueue.set(`${Date.now()}.${Math.random()}|success`, messages);
    },
  },
  onBuildComplete: (callback: any) => {
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
      UmiPluginOss({
        ...umiApi,
        config: {
          oss: {
            bucket: {
              name: 'test',
              region: 'oss-cn-beijing',
            },
          }
        }
      } as any);
    }).toThrow();
    expect(messageQueue.size).toBe(0);
  });

  // test('UmiPluginOss with default options', async () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: {
  //         name: 'test',
  //         region: 'oss-cn-beijing',
  //       },
  //     });
  //   }).not.toThrow();
  //   await wait(0.1);
  //   expect(messageQueue.size).toBe(6);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('success')).toBe(true);
  //   expect(messageQueue.get(keys[0])[0].includes('umi.js')).toBe(true);
  // });

  // test('UmiPluginOss without bucket configuration', () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { region: 'oss-cn-beijing' },
  //     });
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { name: 'test' },
  //     });
  //   }).not.toThrow();
  //   expect(messageQueue.size).toBe(2);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('error')).toBe(true);
  // });

  // test('UmiPluginOss with RegExp acl rule', async () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { endpoint: 'oss-cn-beijing.example.com' },
  //       acl: { publicRead: new RegExp('.js') },
  //     });
  //   }).not.toThrow();
  //   await wait(0.1);
  //   expect(messageQueue.size).toBe(6);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('success')).toBe(true);
  //   expect(messageQueue.get(keys[0])[0].includes('...')).toBe(true);
  //   expect(messageQueue.get(keys[0])[0].includes('public-read')).toBe(true);
  // });

  // test('UmiPluginOss with ignore filter', () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { endpoint: 'oss-cn-beijing.example.com' },
  //       ignore: {
  //         extname: ['.html'],
  //         sizeBetween: [[0, 1000]],
  //       },
  //     });
  //   }).not.toThrow();
  //   expect(messageQueue.size).toBe(1);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('success')).toBe(true);
  //   expect(messageQueue.get(keys[0])[0]).toBe('There is nothing need to be uploaded.\n');
  // });

  // test('UmiPluginOss with bijection', async () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { endpoint: 'oss-cn-beijing.example.com' },
  //       bijection: true,
  //       waitBeforeDelete: 0,
  //       ignore: { extname: false },
  //       prefix: 'other/',
  //     });
  //   }).not.toThrow();
  //   await wait(0.1);
  //   expect(messageQueue.size).toBe(10);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('success')).toBe(true);
  //   expect(keys[9].endsWith('success')).toBe(true);
  //   expect(messageQueue.get(keys[0])[0].includes('will be deleted')).toBe(true);
  //   expect(messageQueue.get(keys[2])[0].includes('umi.js')).toBe(true);
  // });

  // test('UmiPluginOss with bijection and ignore files', async () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { endpoint: 'oss-cn-beijing.example.com' },
  //       bijection: true,
  //       waitBeforeDelete: 0,
  //       ignore: { extname: ['.html'] },
  //     });
  //   }).not.toThrow();
  //   await wait(0.1);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(messageQueue.get(keys[0])[0].includes('index.html')).toBe(false);
  // });

  // test('UmiPluginOss with ignore existsInOss', async () => {
  //   messageQueue.clear();
  //   expect(() => {
  //     UmiPluginOss(umiApi as any, {
  //       accessKeyId: 'test',
  //       accessKeySecret: 'test',
  //       bucket: { endpoint: 'oss-cn-beijing.example.com' },
  //       ignore: { existsInOss: true },
  //     });
  //   }).not.toThrow();
  //   await wait(0.1);
  //   expect(messageQueue.size).toBe(4);
  //   const keys = Array.from(messageQueue.keys());
  //   expect(keys[0].endsWith('success')).toBe(true);
  //   expect(messageQueue.get(keys[1])[0].includes('umi.js')).toBe(false);
  // });
});