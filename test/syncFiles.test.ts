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
  });
});
