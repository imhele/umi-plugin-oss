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
      return ({
        name: targetKey,
        res: {
          status,
        },
      });
    } catch (err) {
      return ({
        name: targetKey,
        res: err.toString(),
      });
    }
  }
};
