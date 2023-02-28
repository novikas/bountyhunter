import { useState } from 'react';
import './App.css';
import PersonPage from './pages/PersonPage';
import SearchPage from './pages/SearchPage';
import { Person } from './types';

function App() {
  const [target, setTarget] = useState<Person>();

  return (
    <div className="App">
      {!target ? (
        <SearchPage setTarget={(person) => setTarget(person)} />
      ) : (
        <PersonPage person={target} back={() => setTarget(undefined)} />
      )}
    </div>
  );
}

export default App;
