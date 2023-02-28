import { useCallback, useRef, useState } from 'react';
import { Person } from '../types';
import './styles.css';

function SearchPage({ setTarget }: { setTarget: (p: Person) => void }) {
  const [list, setList] = useState<Person[]>([]);

  const search = useRef('');
  const timerId = useRef<NodeJS.Timeout>();
  const abortController = useRef(new AbortController());

  const fetchPersons = useCallback(async () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    try {
      const result = await fetch(
        `https://swapi.dev/api/people/?search=${search.current}`,
        {
          signal,
        },
      );
      const data = await result.json();
      setList(data.results);

      timerId.current = undefined;
    } catch (e) {
      console.log('Request Failed', e);
    }
  }, []);

  return (
    <div className="container" data-testid="searchField">
      <label>Search: </label>
      <input
        onChange={(e) => {
          clearTimeout(timerId.current);

          search.current = e.target.value;

          timerId.current = setTimeout(fetchPersons, 400);
        }}
      />
      <ul className="container">
        {list.map((person) => {
          return (
            <li
              key={`${person.name}${person.homeworld}`}
              className="listItem"
              onClick={() => {
                setTarget(person);
              }}
            >{`Name: ${person.name}`}</li>
          );
        })}
      </ul>
    </div>
  );
}

export default SearchPage;
