# umi-plugin-oss

[![NPM version](https://img.shields.io/npm/v/umi-plugin-oss.svg?style=flat)](https://npmjs.org/package/umi-plugin-oss)
[![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-oss.svg?style=flat)](https://npmjs.org/package/umi-plugin-oss)
[![Build Status](https://img.shields.io/travis/imhele/umi-plugin-oss.svg?style=flat)](https://travis-ci.org/imhele/umi-plugin-oss)
[![Coverage Status](https://coveralls.io/repos/github/imhele/umi-plugin-oss/badge.svg?branch=master)](https://coveralls.io/github/imhele/umi-plugin-oss?branch=master)
[![License](https://img.shields.io/npm/l/umi-plugin-oss.svg)](https://npmjs.org/package/umi-plugin-oss)

**Just add a plugin into your [Umi](https://github.com/umijs/umi) project, automatically upload productions to [OSS@AliCloud](https://www.alibabacloud.com/product/oss) !**

## Usage

```sh
$ npm install umi-plugin-oss --save-dev
or
$ yarn add umi-plugin-oss --dev
```
Add `umi-plugin-oss` into `.umirc.js` or `config.js` of your `UmiJS` project. [UmiJS - Plugin usage](https://umijs.org/plugin/#plugin-usage)

```js
export default {
  plugins: [
    ['umi-plugin-oss', options],
  ],
}
```

## Options
### Overview

```ts
interface Options {
  accessKeyId?: string;
  accessKeySecret?: string;
  acl?: ACLType | ACLRule;
  bijection?: boolean;
  bucket?: {
    cname?: boolean;
    endpoint?: string;
    internal?: boolean;
    name?: string;
    region?: string;
  };
  headers?: {
    'Cache-Control'?: string;
    'Content-Disposition'?: string;
    'Content-Encoding'?: string;
    'Expires'?: string;
    'x-oss-object-acl'?: ACLType;
    'x-oss-server-side-encryption'?: 'AES256' | 'KMS';
    'x-oss-server-side-encryption-key-id'?: string;
    [key: string]: string;
  };
  ignore?: {
    extname?: string[];
    existsInOss?: boolean;
    sizeBetween?: Array<[number, number]>;
  };
  prefix?: string;
  secure?: boolean;
  stsToken?: string;
  timeout?: number;
  waitBeforeDelete?: number;
  waitBeforeUpload?: number;
}

type ACLType = 'public-read-write' | 'public-read' | 'private';

interface ACLRule {
  private?: RegExp | string[];
  publicRead?: RegExp | string[];
  publicReadWrite?: RegExp | string[];
  else?: ACLType;
}
```

## Example
Visit it at [examples/base](https://github.com/imhele/umi-plugin-oss/tree/master/examples/base)
