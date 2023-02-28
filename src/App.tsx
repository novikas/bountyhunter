import React, { useEffect, useRef, useState } from 'react';
import './App.css';

type Person = {
  homeworld: string;
  name: string;
};

type Location = {
  name: string;
};

type PersonWithLocation = Person & {
  location?: Location;
};

function App() {
  const [list, setList] = useState<PersonWithLocation[]>([]);

  const search = useRef('');
  const timerId = useRef<NodeJS.Timeout>();
  const abortController = useRef(new AbortController());

  useEffect(() => {}, [list]);
  return (
    <div className="App">
      <label>Search:</label>
      <input
        onChange={(e) => {
          clearTimeout(timerId.current);

          search.current = e.target.value;

          timerId.current = setTimeout(async () => {
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

              const locationPromises = data.results.map((p: Person) =>
                // Here we pass the same signal to fetch 
                // in order to cancel subsequent location requests
                fetch(p.homeworld, { signal }).then((res) => res.json()),
              );
              const settledPromises = await Promise.allSettled(
                locationPromises,
              );

              const personsWithLocation = data.results.map(
                (p: Person, idx: number) => {
                  const location = settledPromises[idx];
                  return {
                    ...p,
                    location:
                      location.status === 'fulfilled'
                        ? location.value
                        : 'Failed to load',
                  };
                },
              );
              setList(personsWithLocation);
              timerId.current = undefined;
            } catch (e) {
              console.log('Request Failed', e);
            }
          }, 400);
        }}
      />
      <ul>
        {list.map((person) => {
          return (
            <li
              key={`${person.name}${person.homeworld}`}
              className="listItem"
            >{`Name: ${person.name} Location: ${
              person.location ? person.location.name : 'Loading'
            }`}</li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
