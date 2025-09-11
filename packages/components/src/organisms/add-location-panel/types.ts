export type Location = {
  latitude: number;
  longitude: number;
  id: string;
  name: string;
};

export type LocationData = {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formatted_address: string;
  types: string[];
};

export interface AddLoactionPanelProps {
  location: Location | null;
  onSelectionChange: (item: Location | null) => void;
}

export interface LocationListProps {
  locations: LocationData[];
  isLoading: boolean;
  query: string;
  handleOnChangeLocation: (location: LocationData) => void;
}
