import 'jest';
import UmiPluginOss from '../src/index';

describe('test index', () => {
  test('api exist', () => {
    expect(UmiPluginOss).toBeTruthy();
  });
});
