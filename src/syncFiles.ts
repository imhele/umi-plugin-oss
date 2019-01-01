import { createReadStream } from 'fs';
import OSS, { ACLType, Options } from 'ali-oss';

export type ACLType = ACLType;
export interface OSSOptions {
  accessKeyId?: string;
  accessKeySecret?: string;
  stsToken?: string;
  secure?: boolean;
  timeout?: number;
  bucket?: {
    name: string;
    region?: string;
    endpoint?: string;
    internal?: boolean;
  };
  headers?: {
    'Cache-Control'?: string;
    'Content-Disposition'?: string;
    'Content-Encoding'?: string;
    'Expires'?: string;
    'x-oss-server-side-encryption'?: 'AES256' | 'KMS';
    'x-oss-server-side-encryption-key-id'?: string;
    'x-oss-object-acl'?: ACLType;
    [key: string]: string;
  };
}
export interface SyncFilesOptions extends OSSOptions {
  cname?: boolean;
}

export default class SyncFiles {
  private oss: OSS;
  constructor(options: SyncFilesOptions) {
    const ossOptions = {
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket.name,
      cname: options.cname,
      endpoint: options.bucket.endpoint,
      internal: options.bucket.internal,
      region: options.bucket.region,
      stsToken: options.stsToken,
      secure: options.secure,
      timeout: options.timeout,
    };
    this.oss = new OSS(ossOptions as Options);
  }
  public upload(filePath: string): false | Error {
    try {
      if (typeof filePath !== 'string') throw new Error();
      return false;
    } catch (err) {
      return err;
    }
  }
  public list(prefix = '/'): string[] {
    return null;
  }
}
