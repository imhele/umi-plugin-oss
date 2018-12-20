import SyncFiles, { OssAcl, SyncFilesOptions } from './syncFiles';

interface UmiApi {
  config: {
    base?: string;
    publicPath?: string;
    cssPublicPath?: string;
  };
  paths: {
    outputPath: string;
    absOutputPath: string;
    pagesPath: string;
    absPagesPath: string;
    tmpDirPath: string;
    absTmpDirPath: string;
    absSrcPath: string;
    cwd: string;
  };
  routes: Array<{
    path: string;
    component: string;
    [key: string]: any;
  }>;
  registerCommand: (name: string, options: {}, fun: (args: Array<string>) => void) => void; // @TODO
  log: {
    success: (...messages: Array<string>) => void;
    error: (...messages: Array<string>) => void;
    debug: (...messages: Array<string>) => void;
    pending: (...messages: Array<string>) => void;
    watch: (...messages: Array<string>) => void;
  };
  debug: (message: string) => void;
  onBuildSuccess: (arg: object) => void;
};

export interface UmiPluginOssOptions {
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
  bijection?: boolean;
  ignore?: {
    fileExists?: boolean;
    fileSizeBetween?: Array<Array<number>>;
  };
};

export default function (api: UmiApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    const syncFiles = new SyncFiles({});
    console.log(api.paths.absOutputPath);
    console.log(api.config.publicPath);
  });
};
