export function readdirSync(path: string): string[] {
  return ['/home/dist/static/', '/home/dist/umi.js', '/home/dist/index.html'];
}

export function statSync(path: string): object {
  if (path.endsWith('/')) {
    return ({
      isFile() {
        return false;
      },
    });
  } else {
    return ({
      isFile() {
        return true;
      },
      size: 500,
    });
  }
}
