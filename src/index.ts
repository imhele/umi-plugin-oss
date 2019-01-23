import path from 'path';
import { IApi } from 'umi-plugin-types';
import { readdirSync, statSync } from 'fs';
import SyncFiles, { ACLType, OSSOptions, FileInfo } from './syncFiles';

export interface ACLRule {
  private?: RegExp | string[];
  publicRead?: RegExp | string[];
  publicReadWrite?: RegExp | string[];
  else?: ACLType;
}

export interface UmiPluginOssOptions extends OSSOptions {
  acl?: ACLType | ACLRule;
  bijection?: boolean;
  delimiter?: string;
  ignore?: {
    extname?: string[];
    existsInOss?: boolean;
    sizeBetween?: Array<[number, number]>;
  };
  waitBeforeDelete?: number;
  waitBeforeUpload?: number;
}

export const defaultOptions: UmiPluginOssOptions = {
  bijection: false,
  bucket: {
    name: undefined,
  },
  headers: {},
  ignore: {},
  waitBeforeDelete: 3,
  waitBeforeUpload: 0,
};

export const handleAcl = (rule: RegExp | string[], fileInfoArr: FileInfo[], acl: ACLType) => {
  if (Array.isArray(rule)) {
    fileInfoArr.forEach(fileInfo => {
      if (rule.includes(fileInfo[0])) {
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

export default function (api: IApi, options?: UmiPluginOssOptions) {
  api.onBuildSuccess((): void => {
    // default value
    options = {
      ...defaultOptions,
      ...options,
    };
    const { extname = ['.html', '.htm'] } = options.ignore;
    let endpoint: string = options.bucket.endpoint;
    let prefix: string = api.config.publicPath || '';

    // check options
    if (typeof api.config.publicPath !== 'string'
      && typeof options.bucket.name !== 'string') {
      return api.log.error('No valid bucket configuration was found.');
    }

    // ensure use `endpoint` or (`region`, `bucket`) or `cname`
    const cname = !endpoint && !options.bucket.region && !options.bucket.name ? true : false;
    if (cname) {
      const urlInfo = new URL(api.config.publicPath);
      endpoint = urlInfo.host;
      prefix = urlInfo.pathname;
      options.bucket.endpoint = endpoint;
    } else {
      try {
        prefix = new URL(api.config.publicPath).pathname;
      } catch (err) {
        prefix = api.config.publicPath || '';
      }
    }
    if (!prefix.endsWith('/')) prefix += '/';
    if (prefix.startsWith('/')) prefix = prefix.slice(1);

    // create instance
    const syncFiles = new SyncFiles({ ...options, cname });

    (async function () {
      // filter unnecessary files
      const { absOutputPath } = api.paths;
      let fileInfoArr: FileInfo[] = readdirSync(absOutputPath)
        .map(name => (<FileInfo>[name, path.join(absOutputPath, name), 'private']));
      if (fileInfoArr.some(fileInfo => fileInfo[0] === 'static')) {
        const staticDir = path.join(absOutputPath, 'static');
        if (statSync(staticDir).isDirectory()) {
          fileInfoArr = fileInfoArr.concat(readdirSync(staticDir).map(name => {
            return (<FileInfo>[`static/${name}`, path.join(staticDir, name), 'private']);
          }));
        }
      }
      fileInfoArr = fileInfoArr.filter(filePath => !extname.includes(path.extname(filePath[0])));
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

      // list exists files
      if (options.bijection || options.ignore.existsInOss) {
        const existsFileArr = await syncFiles.list(prefix, api);
        if (options.bijection) {
          const delFileArr = existsFileArr.filter(filename => {
            return fileInfoArr.some(fileInfo => fileInfo[0] !== filename);
          });
          api.log.success(`The following files will be delete:\n${delFileArr.join('\n')}`);
          const deleteCosts = await syncFiles.delete(prefix, delFileArr, api);
          api.log.success(`Deleted in ${deleteCosts / 1000}s`);
        }
        if (options.ignore.existsInOss) {
          fileInfoArr = fileInfoArr.filter(fileInfo => {
            return existsFileArr.includes(fileInfo[0]);
          });
        }
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

      // Empty list
      if (!fileInfoArr.length) {
        // @TODO: bijection => delete files
        return api.log.success('There is nothing need to upload.');
      }

      // upload and print results
      api.log.success(`The following files will be uploaded to ${
        endpoint || options.bucket.name
        }/${prefix}:\n${
        fileInfoArr.map(fileInfo => `${fileInfo[0]}    ${fileInfo[2]}`).join('\n')
        }`);

      const uploadCosts = await syncFiles.upload(prefix, fileInfoArr, api);
      api.log.success(`Uploaded in ${uploadCosts / 1000}s`);
    })();
  });
}
