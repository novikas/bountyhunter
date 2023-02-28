// @ts-nocheck
// It seems excessive to fix all ts errors here for test task.
// But in production it would be necessary ofcourse
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { PersonOptions, PersonSearch } from '../pages/SearchPage';
import { wait } from '@testing-library/user-event/dist/utils';
import { people } from './fixtures';

beforeEach(() => {
  fetch.resetMocks();
});

describe('PersonSearch', () => {
  test('renders main page', () => {
    render(<App />);
    const searchLabel = screen.getByText(/Search/i);
    expect(searchLabel).toBeInTheDocument();
  });

  test('search input triggers correct request', async () => {
    const listUpdatedMock = jest.fn();
    const testSearch = 'luk';
    fetch.mockResponseOnce(JSON.stringify(people));

    render(<PersonSearch listUpdated={listUpdatedMock} debounceTime={0} />);

    const input = screen.getByTestId('searchField');
    fireEvent.change(input, { target: { value: testSearch } });
    expect(input.value).toBe(testSearch);

    await wait(0);
    expect(fetch).toBeCalledWith(
      `https://swapi.dev/api/people/?search=${testSearch}`,
      { signal: new AbortController().signal },
    );
    expect(listUpdatedMock).toBeCalledWith(people.results);
  });

  test("search input doesn't trigger fetch until debounce cooldown expires", async () => {
    const listUpdatedMock = jest.fn();
    const testSearch = 'luk';
    fetch.mockResponseOnce(JSON.stringify(people));

    render(<PersonSearch listUpdated={listUpdatedMock} debounceTime={10} />);

    const input = screen.getByTestId('searchField');
    fireEvent.change(input, { target: { value: testSearch } });
    expect(input.value).toBe(testSearch);
    await wait(0);
    expect(listUpdatedMock).toBeCalledTimes(0);

    // This is not really good practice to rely on delays in tests.
    // While it makes tests slower it also increases a risk to produce flaky tests
    // But jsut for demo purposes in this case I think it is fine
    await wait(15);
    expect(fetch).toBeCalledWith(
      `https://swapi.dev/api/people/?search=${testSearch}`,
      { signal: new AbortController().signal },
    );
    expect(listUpdatedMock).toBeCalledWith(people.results);
  });
});

const noop = () => {};

// Options Component
describe('PersonOptions', () => {
  test('component renders correct list', async () => {
    render(<PersonOptions persons={people.results} onClick={noop} />);

    people.results.forEach((p) => {
      const item = screen.getByTestId(p.name);
      expect(item).toBeInTheDocument();
    });
  });

  test('component renders placeholed in case list is empty', async () => {
    render(<PersonOptions persons={[]} onClick={noop} />);

    screen.getByTestId('emptyListPlaceholder');
  });

  test('component calls onClick with correct params', async () => {
    const onClickMock = jest.fn();
    render(<PersonOptions persons={people.results} onClick={onClickMock} />);

    const personItem = screen.getByTestId(people.results[0].name);

    fireEvent.click(personItem);

    expect(onClickMock).toBeCalledWith(people.results[0]);
  });
});
