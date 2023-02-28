export type Person = {
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
