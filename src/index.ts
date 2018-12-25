import { readdirSync } from 'fs';
import SyncFiles, { ACLType, OSSOptions, SyncFilesOptions } from './syncFiles';

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
  registerCommand: (name: string, options: {}, fun: (args: string[]) => void) => void; // @TODO
  log: {
    success: (...messages: string[]) => void;
    error: (...messages: string[]) => void;
    debug: (...messages: string[]) => void;
    pending: (...messages: string[]) => void;
    watch: (...messages: string[]) => void;
  };
  debug: (message: string) => void;
  onBuildSuccess: (arg: object) => void;
}

export interface UmiPluginOssOptions extends OSSOptions {
  bijection?: boolean;
  acl?: ACLType | {
    private?: RegExp | string;
    publicRead?: RegExp | string;
    publicReadWrite?: RegExp | string;
  };
  ignore?: {
    fileExists?: boolean;
    fileSizeBetween?: number[][];
  };
}

export default function (api: UmiApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    if (typeof api.config.publicPath !== 'string'
      && typeof options.bucket !== 'object') {
      return api.log.error('No valid bucket configuration was found.');
    }
    const syncFiles = new SyncFiles({
      ...options,
      cname: !options.bucket && api.config.publicPath,
    });
    const fileArr = readdirSync(api.paths.absOutputPath);
    api.log.debug(...fileArr);
    const uploadResult = fileArr.map(syncFiles.upload).filter(err => err) as string[];
    api.log.error(...uploadResult);
  });
}
