import { normalizeUrl } from './normalizeUrl';

describe('normalizeUrl()', () => {
  it('path only', () => {
    expect(normalizeUrl('/foo/bar')).toBe('/foo/bar');
    expect(normalizeUrl('/foo/bar/')).toBe('/foo/bar');
    expect(normalizeUrl('/foo/bar?')).toBe('/foo/bar');
  });

  it('host + path', () => {
    expect(normalizeUrl('https://example.com/foo/bar')).toBe('https://example.com/foo/bar');
    expect(normalizeUrl('https://example.com/foo/bar/')).toBe('https://example.com/foo/bar');
    expect(normalizeUrl('https://example.com/foo/bar?')).toBe('https://example.com/foo/bar');
  });

  it('path + params', () => {
    expect(normalizeUrl('/foo/bar', { b: 2, a: 1 })).toBe('/foo/bar?a=1&b=2');
  });

  it('path + search', () => {
    expect(normalizeUrl('/foo/bar?a=1&b=2')).toBe('/foo/bar?a=1&b=2');
    expect(normalizeUrl('/foo/bar?b=2&a=1')).toBe('/foo/bar?a=1&b=2');
    expect(normalizeUrl('/foo/bar?b=2&a=1&c=')).toBe('/foo/bar?a=1&b=2');
  });
});
