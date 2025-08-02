import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DatePicker from "react-datepicker"; // DatePicker bileşeni
import { format } from "date-fns"; // Tarih formatlama
import "@/../node_modules/react-datepicker/dist/react-datepicker.css"; // DatePicker CSS
import { useLanguage } from "../../contexts/LanguageContext"; // Dil bilgisi için hook

// Locale ayarları
import { registerLocale } from "react-datepicker";
import tr from "date-fns/locale/tr";
import enUS from "date-fns/locale/en-US";
registerLocale("tr", tr);
registerLocale("en", enUS);

function RouteSearchForm({ 
  locations, 
  searchData, 
  setSearchData, 
  onSearch,
  loading
}) {
  const { t, language } = useLanguage(); // Dil bilgisi (language: 'tr' veya 'en')
  
  // Arama state'leri
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  
  // Modal state'leri
  const [showAllLocationsModal, setShowAllLocationsModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [selectedLocationType, setSelectedLocationType] = useState("origin"); // "origin" veya "destination"

  // Ref'ler
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  // Yardımcı: string yerine Date nesnesi bekleyen DatePicker'a dönüştür
  const selectedDate = searchData.date ? new Date(searchData.date) : null;

  // Filtrelenmiş lokasyonlar
  const filteredOriginLocations = useMemo(() => {
    return locations.filter(location => 
      location.name.toLowerCase().includes(originSearch.toLowerCase()) ||
      location.locationCode.toLowerCase().includes(originSearch.toLowerCase()) ||
      location.city.toLowerCase().includes(originSearch.toLowerCase())
    );
  }, [locations, originSearch]);

  const filteredDestinationLocations = useMemo(() => {
    return locations.filter(location => 
      location.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      location.locationCode.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      location.city.toLowerCase().includes(destinationSearch.toLowerCase())
    );
  }, [locations, destinationSearch]);

  // Modal için filtrelenmiş ve gruplandırılmış lokasyonlar
  const filteredAndGroupedLocations = useMemo(() => {
    const filtered = locations.filter(location => 
      location.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      location.locationCode.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      location.country.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );

    // Ülke bazlı gruplandırma
    const grouped = filtered.reduce((acc, location) => {
      const country = location.country;
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(location);
      return acc;
    }, {});

    // Ülkeleri alfabetik sırala
    return Object.keys(grouped)
      .sort()
      .reduce((acc, country) => {
        acc[country] = grouped[country].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {});
  }, [locations, modalSearchTerm]);

  // Seçilen lokasyonları bul
  const selectedOrigin = locations.find(loc => loc.locationCode === searchData.originLocationCode);
  const selectedDestination = locations.find(loc => loc.locationCode === searchData.destinationLocationCode);

  // Seçilen lokasyonları input'lara yansıt
  useEffect(() => {
    if (selectedOrigin) {
      setOriginSearch(selectedOrigin.name);
    } else {
      setOriginSearch('');
    }
  }, [selectedOrigin, searchData.originLocationCode]);

  useEffect(() => {
    if (selectedDestination) {
      setDestinationSearch(selectedDestination.name);
    } else {
      setDestinationSearch('');
    }
  }, [selectedDestination, searchData.destinationLocationCode]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOriginSelect = (location) => {
    setSearchData(prev => ({
      ...prev,
      originLocationCode: location.locationCode
    }));
    setOriginSearch(location.name);
    setShowOriginDropdown(false);
  };

  const handleDestinationSelect = (location) => {
    setSearchData(prev => ({
      ...prev,
      destinationLocationCode: location.locationCode
    }));
    setDestinationSearch(location.name);
    setShowDestinationDropdown(false);
  };

  const handleModalLocationSelect = (location) => {
    if (selectedLocationType === "origin") {
      handleOriginSelect(location);
    } else {
      handleDestinationSelect(location);
    }
    setShowAllLocationsModal(false);
    setModalSearchTerm("");
  };

  const openAllLocationsModal = (type) => {
    setSelectedLocationType(type);
    setShowAllLocationsModal(true);
    setModalSearchTerm("");
  };

  return (
    <>
      <Card className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.routes.origin}
              </label>
              <div className="relative" ref={originRef}>
                <Input
                  type="text"
                  placeholder={t.routes.searchLocation}
                  value={originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAllLocationsModal("origin")}
                  className="absolute right-1 top-1 h-8 px-2 text-xs hidden sm:inline-flex"
                >
                  {t.routes.viewAll}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAllLocationsModal("origin")}
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-xs sm:hidden"
                  title={t.routes.viewAll}
                >
                  ⋯
                </Button>
                {showOriginDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOriginLocations.length > 0 ? (
                      filteredOriginLocations.map(location => (
                        <div
                          key={location.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleOriginSelect(location)}
                        >
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">
                            {location.city}, {location.country} ({location.locationCode})
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">
                        {t.routes.noLocationsFound}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.routes.destination}
              </label>
              <div className="relative" ref={destinationRef}>
                <Input
                  type="text"
                  placeholder={t.routes.searchLocation}
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value);
                    setShowDestinationDropdown(true);
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAllLocationsModal("destination")}
                  className="absolute right-1 top-1 h-8 px-2 text-xs hidden sm:inline-flex"
                >
                  {t.routes.viewAll}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAllLocationsModal("destination")}
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-xs sm:hidden"
                  title={t.routes.viewAll}
                >
                  ⋯
                </Button>
                {showDestinationDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredDestinationLocations.length > 0 ? (
                      filteredDestinationLocations.map(location => (
                        <div
                          key={location.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleDestinationSelect(location)}
                        >
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">
                            {location.city}, {location.country} ({location.locationCode})
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">
                        {t.routes.noLocationsFound}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium"> {}
                {t.routes.date}
              </label>
              <div>
              <DatePicker
                locale={language === "tr" ? "tr" : "en"} // Dil ayarına göre locale
                selected={selectedDate}
                onChange={(dt) =>
                  setSearchData((prev) => ({
                    ...prev,
                    date: dt ? format(dt, "yyyy-MM-dd") : "", // ISO string formatı
                  }))
                }
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-aa-gg"
                className="w-full rounded-md border border-gray-300 px-3 py-2" 
                calendarStartDay={1} // Pazartesi başlangıcı
                required
              />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? t.routes.searching : t.routes.search}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Tüm Lokasyonlar Modal */}
      <Dialog open={showAllLocationsModal} onOpenChange={setShowAllLocationsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedLocationType === "origin" ? t.routes.selectOriginLocation : t.routes.selectDestinationLocation}
            </DialogTitle>
            <DialogDescription>
              {t.routes.selectLocationDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Arama Input */}
            <Input
              type="text"
              placeholder={t.routes.searchAllLocations}
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
              className="w-full"
            />
            
            {/* Lokasyonlar Listesi */}
            <div className="max-h-[60vh] overflow-y-auto">
              {Object.keys(filteredAndGroupedLocations).length > 0 ? (
                Object.entries(filteredAndGroupedLocations).map(([country, countryLocations]) => (
                  <div key={country} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                      {country}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {countryLocations.map(location => (
                        <div
                          key={location.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleModalLocationSelect(location)}
                        >
                          <div className="font-medium text-gray-900">{location.name}</div>
                          <div className="text-sm text-gray-600">{location.city}</div>
                          <div className="text-xs text-gray-500 font-mono">{location.locationCode}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t.routes.noLocationsFound}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RouteSearchForm;