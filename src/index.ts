import SyncFiles, { ACLType, OSSOptions, SyncFilesOptions } from './syncFiles';

interface Ite {
  test: string;
}

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
  acl?: ACLType | {
    private?: RegExp | string;
    publicRead?: RegExp | string;
    publicReadWrite?: RegExp | string;
  };
  bijection?: boolean;
  ignore?: {
    fileExists?: boolean;
    fileSizeBetween?: number[][];
  };
}

export default function (api: UmiApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    const syncFiles = new SyncFiles({ ...options });
    api.log.debug(api.paths.absOutputPath);
    api.log.debug(api.config.publicPath);
  });
}
