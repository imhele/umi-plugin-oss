import OSS, { Options, ACLType } from 'ali-oss';

export type ACLType = ACLType;
export type OSSOptions = {
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
};
export type SyncFilesOptions = OSSOptions & {
  cname?: string;
};


export default class SyncFiles {
  oss: OSS;
  constructor(options: SyncFilesOptions) {
    const ossOptions: Options = {
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      stsToken: options.stsToken,
      secure: options.secure,
      timeout: options.timeout,
      endpoint: options.bucket ? options.bucket.name : options.cname,
      bucket: options.bucket && options.bucket.name,
      region: options.bucket && options.bucket.region,
      internal: options.bucket && options.bucket.internal,
    };
    this.oss = new OSS(ossOptions);
  }
};
