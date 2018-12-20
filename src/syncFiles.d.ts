export type OssAcl = 'public-read-write' | 'public-read' | 'private';

export type SyncFilesOptions = {
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
  acl?: OssAcl | {
    private?: RegExp | string;
    publicRead?: RegExp | string;
    publicReadWrite?: RegExp | string;
  };
  headers?: {
    'Cache-Control'?: string;
    'Content-Disposition'?: string;
    'Content-Encoding'?: string;
    'Expires'?: string;
    'x-oss-server-side-encryption'?: 'AES256' | 'KMS';
    'x-oss-server-side-encryption-key-id'?: string;
    'x-oss-object-acl'?: OssAcl;
    [key: string]: string;
  };
}

export default class SyncFiles {
  constructor(options: SyncFilesOptions);
}
