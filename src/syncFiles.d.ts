import { IApi } from 'umi';
export declare type ACLType = 'public-read-write' | 'public-read' | 'private' | undefined;
export declare type FileInfo = [string, string, ACLType];
export interface OssHeaders {
    'Cache-Control'?: string;
    'Content-Disposition'?: string;
    'Content-Encoding'?: string;
    'Expires'?: string;
    'x-oss-server-side-encryption'?: 'AES256' | 'KMS';
    'x-oss-server-side-encryption-key-id'?: string;
    'x-oss-object-acl'?: ACLType;
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
export declare const wait: (seconds?: number) => Promise<any>;
export default class SyncFiles {
    private oss;
    private options;
    constructor(options: SyncFilesOptions);
    upload(prefix: string, fileInfoArr: FileInfo[], api: IApi): Promise<number>;
    list(prefix: string, api: IApi): Promise<string[]>;
    delete(prefix: string, delFileArr: string[], api: IApi): Promise<number>;
}
