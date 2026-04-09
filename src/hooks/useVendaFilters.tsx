import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";


export const useVendaFilters = () => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");

  const debouncedSearch = useDebounce(search, 500);

  const activeFilters = useMemo(() => {
    const isSearching = debouncedSearch.trim().length > 0;

    return {
      search: debouncedSearch,
      // Se estiver buscando, as datas e status são anulados para a API
      startDate: isSearching ? "" : startDate,
      endDate: isSearching ? "" : endDate,
      status: isSearching ? [] : statusFilter,
      marketplaceId: marketplaceFilter === "all" ? undefined : marketplaceFilter,
      isSearching
    };
  }, [debouncedSearch, startDate, endDate, statusFilter, marketplaceFilter]);

  return {
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    marketplaceFilter,
    setMarketplaceFilter,
    activeFilters
  };
};