import { IApi } from 'umi';
import { ACLType, OSSOptions, FileInfo } from './syncFiles';
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
        extname?: string[] | false;
        existsInOss?: boolean;
        sizeBetween?: Array<[number, number]>;
    };
    prefix?: string;
    waitBeforeDelete?: number;
    waitBeforeUpload?: number;
}
export declare const defaultOptions: UmiPluginOssOptions;
export declare const handleAcl: (rule: RegExp | string[], fileInfoArr: FileInfo[], acl: ACLType) => void;
declare const _default: (api: IApi) => void;
export default _default;
