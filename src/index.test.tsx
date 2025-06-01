import * as members from '.';

describe('members', () => {
  it('should match snapshot', () => {
    expect(members).toMatchSnapshot();
  });
});
