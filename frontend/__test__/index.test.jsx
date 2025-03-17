import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import FetchDataComponent from '../pages/index'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Hello from API" }),
  })
);

describe('FetchDataComponent', () => {
  it('renders the page Home', async () => {
    const { getByText } = render(<FetchDataComponent />)
    
    await waitFor(() => {
      expect(getByText("Hello from API")).toBeInTheDocument()
    })
  })
})
