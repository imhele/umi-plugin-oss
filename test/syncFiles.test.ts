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

  test('SyncFiles.upload', () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    expect(instance.upload('', [], umiApi.log)).toBeInstanceOf(Promise);
    expect(() => {
      instance.upload('', [
        ['200', '/home/notexist/umi.js', 'private'],
        ['403', '/home/notexist/umi.js', 'private'],
      ], umiApi.log).then(time => {
        expect(typeof time === 'number').toBe(true);
        const keys = Array.from(messageQueue.keys());
        const error = keys.find(k => k.endsWith('error'));
        expect(error).not.toBe(undefined);
        expect(messageQueue.get(error)[0]).toBe('403');
      });
    }).not.toThrow();
  });

  test('SyncFiles.list', () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    instance.list('test/in/syncFiles/', umiApi.log).then(existsFileArr => {
      expect(existsFileArr).toMatchObject(['test.png']);
    });
    instance.list('404', umiApi.log).then(existsFileArr => {
      expect(existsFileArr.length).toBe(0);
      expect(messageQueue.size).toBe(1);
    });
  });

  test('SyncFiles.delete', () => {
    messageQueue.clear();
    const options: SyncFilesOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    const instance = new SyncFiles(options);
    expect(instance.delete('dir/', ['umi.js'], umiApi.log)).toBeInstanceOf(Promise);
    instance.delete('dir/', ['IGONRE_ME'], umiApi.log).then(() => {
      const values: string[][] = Array.from(messageQueue.values());
      expect(values.some(k => k[0].includes('Delete failed'))).toBe(true);
    });
    instance.delete('', ['404'], umiApi.log).then(() => {
      const values: string[][] = Array.from(messageQueue.values());
      expect(values.some(k => k[0].includes('404'))).toBe(true);
    });
  });
});
