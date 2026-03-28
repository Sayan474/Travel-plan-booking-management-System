import { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selection, setSelection] = useState(null);
  const [searchData, setSearchData] = useState({});

  const value = useMemo(
    () => ({ selection, setSelection, searchData, setSearchData }),
    [selection, searchData]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return context;
}
