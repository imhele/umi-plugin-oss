import OSS from 'ali-oss';
import { createReadStream } from 'fs';
import { IApi } from 'umi-plugin-types';

export type ACLType = 'public-read-write' | 'public-read' | 'private';

export type FileInfo = [string, string, ACLType];

export interface OssHeaders {
  'Cache-Control'?: string;
  'Content-Disposition'?: string;
  'Content-Encoding'?: string;
  'Expires'?: string;
  'x-oss-server-side-encryption'?: 'AES256' | 'KMS';
  'x-oss-server-side-encryption-key-id'?: string;
  'x-oss-object-acl'?: ACLType;
  [key: string]: string;
}

export interface OSSOptions {
  accessKeyId?: string;
  accessKeySecret?: string;
  stsToken?: string;
  secure?: boolean;
  timeout?: number;
  bucket?: {
    name?: string;
    cname?: boolean;
    endpoint?: string;
    internal?: boolean;
    region?: string;
  };
  headers?: OssHeaders;
}

export interface SyncFilesOptions extends OSSOptions {
  cname?: boolean;
  waitBeforeDelete?: number;
  waitBeforeUpload?: number;
}

export const wait = async function (seconds: number = 0): Promise<any> {
  if (seconds)
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

export default class SyncFiles {
  private oss: any;
  private options: SyncFilesOptions;
  constructor(options: SyncFilesOptions) {
    const ossOptions = {
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket.name,
      cname: options.bucket.cname,
      endpoint: options.bucket.endpoint,
      internal: options.bucket.internal,
      region: options.bucket.region,
      stsToken: options.stsToken,
      secure: options.secure,
      timeout: options.timeout,
    };
    this.options = options;
    this.oss = new OSS(ossOptions);
  }
  public async upload(prefix: string, fileInfoArr: FileInfo[], api: IApi): Promise<number> {
    await wait(this.options.waitBeforeUpload);
    const globalStartTime = Date.now();
    for (const fileInfo of fileInfoArr) {
      const startTime = Date.now();
      const targetKey = `${prefix}${fileInfo[0]}`;
      api.log.pending(`Uploading ${targetKey}...`);
      const stream = createReadStream(fileInfo[1]);
      const headers: OssHeaders = {
        ...this.options.headers,
        'x-oss-object-acl': fileInfo[2],
      };
      const result = await this.oss.putStream(targetKey, stream, { headers });
      if (result.res.status === 200) {
        api.log.success(targetKey, `${(Date.now() - startTime) / 100}s`);
      } else {
        api.log.error(targetKey, JSON.stringify(result.res));
      }
    }
    return new Promise(resolve => resolve(Date.now() - globalStartTime));
  }
  public async list(prefix: string, api: IApi): Promise<string[]> {
    let marker: string | null = prefix;
    const existsFileArr: string[] = [];
    while (typeof marker === 'string') {
      const result = await this.oss.list({ prefix, marker });
      if (result.res.status === 200) {
        existsFileArr.push(...result.objects.map((obj: any) => obj.name));
        marker = result.nextMarker;
      } else {
        api.log.error(JSON.stringify(result.res));
        break;
      }
    }
    return new Promise(resolve => {
      resolve(existsFileArr.map(targetKey => targetKey.replace(prefix, '')));
    });
  }
  public async delete(prefix: string, delFileArr: string[], api: IApi): Promise<number> {
    await wait(this.options.waitBeforeDelete);
    const globalStartTime = Date.now();
    delFileArr = delFileArr.map(filename => `${prefix}${filename}`);
    const result = await this.oss.deleteMulti(delFileArr);
    if (result.res.status === 200) {
      const failed = delFileArr.filter(targetKey => {
        return !(<string[]>(result.deleted)).includes(targetKey);
      });
      if (failed.length) {
        api.log.error(`Delete failed:\n${failed.join('\n')}\n`);
      }
    } else {
      api.log.error(JSON.stringify(result.res));
    }
    return new Promise(resolve => resolve(Date.now() - globalStartTime));
  }
}
