export function join(...paths: string[]) {
  return `/home/dist/${paths.slice(1).join('/')}`;
}

export function extname(name: string) {
  return `.${name.split('.').reverse()[0]}`;
}

export default { join, extname };
