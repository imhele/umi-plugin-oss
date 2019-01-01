import path from 'path';
import { readdirSync, statSync } from 'fs';
import SyncFiles, { ACLType, OSSOptions } from './syncFiles';

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

export interface ACLRule {
  private?: RegExp | string[];
  publicRead?: RegExp | string[];
  publicReadWrite?: RegExp | string[];
  else?: ACLType | 'private';
}

export interface UmiPluginOssOptions extends OSSOptions {
  bijection?: boolean;
  acl?: ACLType | 'private' | ACLRule; // @https://github.com/DefinitelyTyped/DefinitelyTyped/pull/31819
  ignore?: {
    extname?: string[];
    existsInOss?: boolean;
    sizeBetween?: Array<[number, number]>;
  };
}

export const defaultOptions: UmiPluginOssOptions = {
  bijection: false,
  bucket: {
    name: undefined,
  },
  headers: {},
  ignore: {},
};

type FileInfo = [string, string, ACLType | 'private'];

const handleAcl = (rule: RegExp | string[], fileInfoArr: FileInfo[], acl: ACLType | 'private') => {
  if (Array.isArray(rule)) {
    fileInfoArr.forEach(fileInfo => {
      if (rule.includes(fileInfo[1])) {
        fileInfo[2] = acl;
      }
    });
  } else if (rule instanceof RegExp) {
    fileInfoArr.forEach(fileInfo => {
      if (rule.test(fileInfo[0])) {
        fileInfo[2] = acl;
      }
    });
  }
};

export default function (api: UmiApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    // check options
    if (typeof api.config.publicPath !== 'string'
      && typeof options.bucket !== 'object') {
      return api.log.error('No valid bucket configuration was found.');
    }

    // default value
    options = {
      ...defaultOptions,
      ...options,
    };
    const { extname = ['.html', '.htm'] } = options.ignore;
    let endpoint: string = options.bucket.endpoint;
    let prefix: string = api.config.publicPath || '';

    // ensure use `endpoint` or (`region`, `bucket`) or `cname`
    const cname = !endpoint && !options.bucket.region && !options.bucket.name ? true : false;
    if (cname) {
      const urlInfo = new URL(api.config.publicPath);
      endpoint = urlInfo.host;
      prefix = urlInfo.pathname;
    } else {
      try {
        prefix = new URL(api.config.publicPath).pathname;
      } catch (err) { }
    }
    if (!prefix.endsWith('/')) prefix += '/';
    if (prefix.startsWith('/')) prefix = prefix.slice(1);

    // create instance
    const syncFiles = new SyncFiles({ ...options, cname });

    // list exists files
    let existsFileArr: string[] = [];
    if (options.bijection || options.ignore.existsInOss) {
      existsFileArr = syncFiles.list(prefix);
      // @TODO
    }

    // filter unnecessary files
    const { absOutputPath } = api.paths;
    let fileInfoArr: FileInfo[] = readdirSync(absOutputPath)
      .map(name => (<FileInfo>[name, path.join(absOutputPath, name), 'private']))
      .concat(readdirSync(path.join(absOutputPath, 'static'))
        .map(name => (<FileInfo>[name, path.join(absOutputPath, 'static', name), 'private'])))
      .filter(filePath => !extname.includes(path.extname(filePath[0])));
    if (Array.isArray(options.ignore.sizeBetween)) {
      fileInfoArr = fileInfoArr.filter(filePath => {
        const stat = statSync(filePath[1]);
        if (!stat.isFile()) return false;
        return !options.ignore.sizeBetween.some(([min, max]) => {
          return stat.size >= min && stat.size <= max;
        });
      });
    } else {
      fileInfoArr = fileInfoArr.filter(filePath => statSync(filePath[1]).isFile());
    }

    // handle files' acl
    options.acl = options.acl || options.headers['x-oss-object-acl'] || 'private';
    if (typeof options.acl === 'string') {
      fileInfoArr.forEach(fileInfo => fileInfo[2] = <FileInfo[2]>options.acl);
    } else {
      (<ACLRule>options.acl).else = (<ACLRule>options.acl).else || 'private';
      fileInfoArr.forEach(fileInfo => fileInfo[2] = (<ACLRule>options.acl).else);
      const { publicReadWrite, publicRead, private: privateAcl } = <ACLRule>options.acl;
      handleAcl(publicReadWrite, fileInfoArr, 'public-read-write');
      handleAcl(publicRead, fileInfoArr, 'public-read');
      handleAcl(privateAcl, fileInfoArr, 'private');
    }

    // debug
    fileInfoArr.forEach(fileInfo => api.log.debug(fileInfo[0], fileInfo[2]));
  });
}
