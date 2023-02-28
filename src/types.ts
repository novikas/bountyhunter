export type Person = {
  id: string;
  homeworld: string;
  name: string;
  url: string;
};

export type Location = {
  name: string;
};

export type PersonEnriched = Person & {
  _location?: Location;
  location: Promise<Location> | Location;
};
