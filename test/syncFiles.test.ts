import 'jest';
import { umiApi, messageQueue } from './index.test';
import SyncFiles, { OSSOptions } from '../src/syncFiles';

jest.mock('fs');
jest.mock('ali-oss');

describe('test syncFiles', () => {
  test('SyncFiles', () => {
    expect(SyncFiles).toBeTruthy();
    expect(() => {
      new SyncFiles({}); // tslint:disable-line
    }).toThrow();
  });

  test('SyncFiles.upload', () => {
    messageQueue.clear();
    const options: OSSOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    expect(() => {
      new SyncFiles(options); // tslint:disable-line
    }).not.toThrow();
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
    const options: OSSOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: 'name',
      },
    };
    expect(() => {
      new SyncFiles(options); // tslint:disable-line
    }).not.toThrow();
    const instance = new SyncFiles(options);
    expect(instance.list()).toBe(null);
    expect(instance.list('/')).toBe(null);
  });
});
