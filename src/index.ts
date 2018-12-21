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

export type UmiPluginOssOptions = OSSOptions & {
  acl?: ACLType | {
    private?: RegExp | string;
    publicRead?: RegExp | string;
    publicReadWrite?: RegExp | string;
  };
  bijection?: boolean;
  ignore?: {
    fileExists?: boolean;
    fileSizeBetween?: Array<Array<number>>;
  };
};

export default function (api: UmiApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    const syncFiles = new SyncFiles({...options});
    console.log(api.paths.absOutputPath);
    console.log(api.config.publicPath);
  });
};
