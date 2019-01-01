import 'jest';
import SyncFiles, { OSSOptions } from '../src/syncFiles';

describe('test syncFiles', () => {
  test('api exist', () => {
    expect(SyncFiles).toBeTruthy();
  });

  test('SyncFiles', () => {
    expect(() => {
      new SyncFiles({});
    }).toThrow();
    expect(() => {
      new SyncFiles({
        accessKeyId: '',
      });
    }).toThrow();
  });

  test('SyncFiles.upload', () => {
    const options: OSSOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: undefined,
      },
    };
    expect(() => {
      new SyncFiles(options);
    }).not.toThrow();
    const instance = new SyncFiles(options);
    expect(instance.upload('')).toBe(false);
    expect(instance.upload(null)).toBeInstanceOf(Error);
  });

  test('SyncFiles.list', () => {
    const options: OSSOptions = {
      accessKeyId: 'test',
      accessKeySecret: 'test',
      bucket: {
        name: undefined,
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
