import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CreatePost from '../app/createPost';

test('renders 5 category rows and navigates to search on selection', () => {
  const { getByText, toJSON } = render(<CreatePost />);

  // Expect the 5 category options to render
  expect(getByText('Movie')).toBeTruthy();
  expect(getByText('TV Show')).toBeTruthy();
  expect(getByText('Game')).toBeTruthy();
  expect(getByText('Book')).toBeTruthy();
  expect(getByText('Music')).toBeTruthy();

  // Simulate selecting a category (Movie)
  fireEvent.press(getByText('Movie'));

  // After selection, the search header should appear (e.g., "Search Movie")
  expect(getByText(/Search Movie/)).toBeTruthy();
});
