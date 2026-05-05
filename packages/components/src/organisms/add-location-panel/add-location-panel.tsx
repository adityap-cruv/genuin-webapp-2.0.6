import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@genuin/ui/components/accordion";
import { MapPinIcon, XIcon } from "@genuin/ui/icons";
import { useState } from "react";

import { useDebouncedLocations } from "@genuin/components/hooks/use-locations";
import { SearchInput } from "@genuin/components/molecules/search-input";
import { SelectableList } from "@genuin/components/molecules/selectable-list";
import { useIpInfo } from "@genuin/components/react-query/api/authentication/ip-info";

import type { AddLoactionPanelProps, LocationData, LocationListProps } from "./types";

function LocationList({ locations, query, handleOnChangeLocation }: LocationListProps) {
  if (!query) return null;

  if (locations.length === 0 && query?.length > 0) {
    return (
      <SelectableList className="gencl:bg-white gencl:max-h-40 gencl:min-h-30 gencl:text-center gencl:text-body-1-medium! gencl:text-secondary-600 gencl:py-3">
        No locations found
      </SelectableList>
    );
  }

  return (
    <SelectableList className="gencl:bg-white gencl:max-h-40 gencl:min-h-30">
      {locations.map((location: LocationData, index: number) => (
        <SelectableList.Item key={location?.id} index={index} onClick={() => handleOnChangeLocation(location)}>
          {location?.name}
        </SelectableList.Item>
      ))}
    </SelectableList>
  );
}

export function AddLoactionPanel({ location, onSelectionChange }: AddLoactionPanelProps) {
  const { data } = useIpInfo();
  const [openItem, setOpenItem] = useState("");
  const [query, setQuery] = useState("");

  const { locations, isLoading: isLocationsLoading } = useDebouncedLocations({
    query,
    latitude: data?.latitude,
    longitude: data?.longitude,
  });

  const handleOnOpenClose = (item: string) => {
    setOpenItem(item);
    if (item && location) {
      setQuery(location.name);
      return;
    }
    setQuery("");
  };

  const handleOnChangeLocation = (item: LocationData) => {
    onSelectionChange({
      id: item.id,
      latitude: item.coordinates.latitude,
      longitude: item.coordinates.longitude,
      name: item.name,
    });
    handleOnOpenClose("");
  };

  const handleOnCancel = () => {
    onSelectionChange(null);
    setQuery("");
    setOpenItem("");
  };

  return (
    <Accordion className="gencl:w-full" collapsible type="single" value={openItem} onValueChange={handleOnOpenClose}>
      <AccordionItem
        className="gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:overflow-clip"
        value="item-1">
        <AccordionTrigger
          className="gencl:text-lg gencl:font-semibold gencl:text-gray-800 gencl:py-2 gencl:px-4"
          openCloseIcon={
            location ? (
              <XIcon
                className="gencl:fill-secondary-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOnCancel();
                }}
              />
            ) : null
          }>
          <div className="gencl:flex gencl:justify-between gencl:w-full gencl:pr-2">
            <span className="gencl:flex gencl:flex-center gencl:gap-3 gencl:text-body-1-semi-bold">
              <MapPinIcon size="lg" />
              {location ? location?.name : "Add Location"}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="gencl:bg-gray-50 gencl:p-3 gencl:bg-secondary-50 gencl:border-t gencl:border-secondary-150">
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
            <SearchInput
              className="gencl:rounded-full gencl:bg-white gencl:appearance-none"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
            />
            <LocationList
              isLoading={isLocationsLoading}
              locations={locations}
              query={query}
              handleOnChangeLocation={handleOnChangeLocation}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
