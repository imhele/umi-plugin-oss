import 'jest';
import { umiApi, messageQueue } from './index.test';
import SyncFiles, { SyncFilesOptions, wait } from '../src/syncFiles';

jest.mock('fs');
jest.mock('ali-oss');

describe('test syncFiles', () => {
  test('SyncFiles', () => {
    expect(SyncFiles).toBeTruthy();
    expect(() => {
      new SyncFiles({}); // tslint:disable-line
    }).toThrow();
    expect(wait(1)).toBeInstanceOf(Promise);
  });

  test('SyncFiles.upload', async () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    await instance.upload('', [], umiApi.log);
    const time = await instance.upload('', [
      ['200', '/home/notexist/umi.js', 'private'],
      ['403', '/home/notexist/umi.js', 'private'],
    ], umiApi.log);
    expect(typeof time === 'number').toBe(true);
    const keys = Array.from(messageQueue.keys());
    const error = keys.find(k => k.endsWith('error'));
    expect(error).not.toBe(undefined);
    expect(messageQueue.get(error)[0]).toBe('403');
  });

  test('SyncFiles.list', async () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    const existsFileArr = await instance.list('test/in/syncFiles/', umiApi.log);
    const existsFileArrB = await instance.list('404', umiApi.log);
    expect(existsFileArr).toMatchObject(['test.png']);
    expect(existsFileArrB.length).toBe(0);
    expect(messageQueue.size).toBe(1);
  });

  test('SyncFiles.delete', async () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    await instance.delete('dir/', ['umi.js'], umiApi.log);
    await instance.delete('dir/', ['IGONRE_ME'], umiApi.log);
    await instance.delete('', ['404'], umiApi.log);
    const values: string[][] = Array.from(messageQueue.values());
    expect(values.some(k => k[0].includes('404'))).toBe(true);
    expect(values.some(k => k[0].includes('Delete failed'))).toBe(true);
  });
});
