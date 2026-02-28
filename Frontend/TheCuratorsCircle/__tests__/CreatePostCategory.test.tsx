import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePost from '../app/createPost';

test('renders category list and handles selection', async () => {
  const { getByText } = render(<CreatePost />);
  
  // Verify categories are rendered
  expect(getByText('Movie')).toBeTruthy();
  expect(getByText('TV Show')).toBeTruthy();
  expect(getByText('Game')).toBeTruthy();
  expect(getByText('Book')).toBeTruthy();
  expect(getByText('Music')).toBeTruthy();
  
  // Simulate selecting Movie
  const movieButton = getByText('Movie');
  fireEvent.press(movieButton);
  
  // Verify navigation to search step (header should show "Search")
  await waitFor(() => {
    expect(getByText(/Search/)).toBeTruthy();
  });
});
