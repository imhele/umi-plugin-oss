import 'jest';
import { umiApi, messageQueue } from './index.test';
import SyncFiles, { OSSOptions } from '../src/syncFiles';

jest.mock('fs');
jest.mock('ali-oss');

describe('test syncFiles', () => {
  test('api exist', () => {
    expect(SyncFiles).toBeTruthy();
  });

  test('SyncFiles', () => {
    expect(() => {
      new SyncFiles({});
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
      new SyncFiles(options);
    }).not.toThrow();
    const instance = new SyncFiles(options);
    expect(instance.upload('', [], umiApi.log)).toBeInstanceOf(Promise);
    expect(() => {
      instance.upload('', [['200', '/home/notexist/umi.js', 'private']], umiApi.log);
      instance.upload('', [['403', '/home/notexist/umi.js', 'private']], umiApi.log);
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
      new SyncFiles(options);
    }).not.toThrow();
    const instance = new SyncFiles(options);
    expect(instance.list()).toBe(null);
    expect(instance.list('/')).toBe(null);
  });
});
