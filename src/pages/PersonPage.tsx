import { useEffect, useState } from 'react';
import { Person, Location } from '../types';

const PersonPage = ({ person, back }: { person: Person, back: () => void }) => {
  const [location, setLocation] = useState<Location>();

  useEffect(() => {
    async function fetchLocation() {
      const resp = await fetch(person.homeworld);
      const loc = await resp.json();
      setLocation(loc);
    }

    fetchLocation();
  }, [person]);

  return (
    <div>
      <div className='row'>{`Target Name: ${person.name}`}</div>
      <div className='row'>{`Target Location: ${
        (location && location.name) || 'Loading ...'
      }`}</div>

      <button className='row' onClick={back}>Back to Search</button>
    </div>
  );
};

export default PersonPage;
