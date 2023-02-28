import { useCallback, useRef, useState } from 'react';
import { Person } from '../types';
import './styles.css';

export const PersonOptions = ({
  persons,
  onClick,
}: {
  persons: Person[];
  onClick: (person: Person) => void;
}) => {
  if (!persons.length) {
    return <div data-testid={'emptyListPlaceholder'}>Nothing Found</div>;
  }
  return (
    <div className="container">
      {persons.map((person) => {
        return (
          <div
            data-testid={person.name}
            key={`${person.name}${person.homeworld}`}
            className="listItem"
            onClick={() => onClick(person)}
          >{`Name: ${person.name}`}</div>
        );
      })}
    </div>
  );
};

export const PersonSearch = ({
  listUpdated,
  debounceTime = 400,
}: {
  listUpdated: (persons: Person[]) => void;
  debounceTime?: number;
}) => {
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

      listUpdated(data.results);

      timerId.current = undefined;
    } catch (e) {
      console.log('Request Failed', e);
    }
  }, [listUpdated]);

  return (
    <div className="container">
      <label>Search: </label>
      <input
        data-testid="searchField"
        onChange={(e) => {
          clearTimeout(timerId.current);

          search.current = e.target.value;

          timerId.current = setTimeout(fetchPersons, debounceTime);
        }}
      />
    </div>
  );
};

function SearchPage({ setTarget }: { setTarget: (p: Person) => void }) {
  const [list, setList] = useState<Person[]>([]);

  return (
    <div className="container">
      <PersonSearch listUpdated={(persons) => setList(persons)} />
      <PersonOptions
        persons={list}
        onClick={(person) => {
          setTarget(person);
        }}
      />
    </div>
  );
}

export default SearchPage;
