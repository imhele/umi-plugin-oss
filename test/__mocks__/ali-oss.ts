import { OSSOptions } from '../../src/syncFiles';

export default class OSS {
  constructor(options: OSSOptions) {
    if (!options.accessKeyId || !options.accessKeySecret) {
      throw new Error();
    }
  }
  public async putStream(targetKey: string, stream: any, options?: object) {
    try {
      const status: number = parseInt(targetKey, 10);
      return {
        name: targetKey,
        res: {
          status,
        },
      };
    } catch (err) {
      return {
        name: targetKey,
        res: {
          status: 200,
        },
      };
    }
  }
  public async list(options: { prefix: string; marker: string }) {
    if (options.prefix === 'other/') {
      return {
        nextMarker: <null>null,
        objects: <object[]>[{ name: 'other/test.png' }],
        res: {
          status: 200,
        },
      };
    } else {
      return {
        nextMarker: <null>null,
        objects: <object[]>[{ name: 'umi.js' }, { name: 'index.html' }],
        res: {
          status: options.prefix === '404' ? 404 : 200,
        },
      };
    }
  }
  public async deleteMulti(delFileArr: string[]) {
    return {
      deleted: delFileArr.filter(f => !f.endsWith('IGONRE_ME')),
      res: {
        status: delFileArr.includes('404') ? 404 : 200,
      },
    };
  }
}
