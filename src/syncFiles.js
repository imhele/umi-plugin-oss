import OSS from 'ali-oss';
import { createReadStream } from 'fs';
export const wait = async function (seconds = 0) {
    if (seconds)
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
export default class SyncFiles {
    constructor(options) {
        const ossOptions = {
            accessKeyId: options.accessKeyId,
            accessKeySecret: options.accessKeySecret,
            bucket: options.bucket?.name,
            cname: options.bucket?.cname,
            endpoint: options.bucket?.endpoint,
            internal: options.bucket?.internal,
            region: options.bucket?.region,
            stsToken: options.stsToken,
            secure: options.secure,
            timeout: options.timeout,
        };
        this.options = options;
        this.oss = new OSS(ossOptions);
    }
    async upload(prefix, fileInfoArr, api) {
        await wait(this.options.waitBeforeUpload);
        const globalStartTime = Date.now();
        for (const fileInfo of fileInfoArr) {
            const startTime = Date.now();
            const targetKey = `${prefix}${fileInfo[0]}`;
            api.logger.profile(`Uploading ${targetKey}...`);
            const stream = createReadStream(fileInfo[1]);
            const headers = {
                ...this.options.headers,
                'x-oss-object-acl': fileInfo[2],
            };
            const result = await this.oss.putStream(targetKey, stream, { headers });
            if (result.res.status === 200) {
                api.logger.log(targetKey, `${(Date.now() - startTime) / 100}s`);
            }
            else {
                api.logger.error(targetKey, JSON.stringify(result.res));
            }
        }
        return new Promise(resolve => resolve(Date.now() - globalStartTime));
    }
    async list(prefix, api) {
        let marker = prefix;
        const existsFileArr = [];
        while (typeof marker === 'string') {
            const result = await this.oss.list({ prefix, marker });
            if (result.res.status === 200) {
                existsFileArr.push(...result.objects.map((obj) => obj.name));
                marker = result.nextMarker;
            }
            else {
                api.logger.error(JSON.stringify(result.res));
                break;
            }
        }
        return new Promise(resolve => {
            resolve(existsFileArr.map(targetKey => targetKey.replace(prefix, '')));
        });
    }
    async delete(prefix, delFileArr, api) {
        await wait(this.options.waitBeforeDelete);
        const globalStartTime = Date.now();
        delFileArr = delFileArr.map(filename => `${prefix}${filename}`);
        const result = await this.oss.deleteMulti(delFileArr);
        if (result.res.status === 200) {
            const failed = delFileArr.filter(targetKey => {
                return !(result.deleted).includes(targetKey);
            });
            if (failed.length) {
                api.logger.error(`Delete failed:\n${failed.join('\n')}\n`);
            }
        }
        else {
            api.logger.error(JSON.stringify(result.res));
        }
        return new Promise(resolve => resolve(Date.now() - globalStartTime));
    }
}
