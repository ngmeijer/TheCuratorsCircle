import React from 'react';
import { render } from '@testing-library/react-native';
import CreatePost from '../app/createPost';

test('renders category list with 5 categories', () => {
  const { getByText } = render(<CreatePost />);
  
  // Verify all 5 categories are rendered
  expect(getByText('Movie')).toBeTruthy();
  expect(getByText('TV Show')).toBeTruthy();
  expect(getByText('Game')).toBeTruthy();
  expect(getByText('Book')).toBeTruthy();
  expect(getByText('Music')).toBeTruthy();
  
  // Verify initial header text
  expect(getByText('What are you sharing?')).toBeTruthy();
});
