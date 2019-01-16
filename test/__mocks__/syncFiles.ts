export * from '../../src/syncFiles';

export default class SyncFiles {
  public async upload(): Promise<number> {
    return 10;
  }
  public async list(): Promise<string[]> {
    return <string[]>['NOT_MATCH_ANY_FILES'];
  }
  public async delete(): Promise<number> {
    return 0.5;
  }
}
