import { render, screen } from '@testing-library/react';
import { ReactFetch } from '.';

describe('<ReactFetch/>', () => {
  it('render', async () => {
    render(<ReactFetch>Hello</ReactFetch>);

    const elem = await screen.findByText('Hello');

    expect(elem.className).toBe('ReactFetch');
  });
});
