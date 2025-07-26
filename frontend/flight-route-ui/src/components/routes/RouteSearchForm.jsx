import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DatePicker from "react-datepicker";            // ①
import { format, parse } from "date-fns";          // ②
import "@/../node_modules/react-datepicker/dist/react-datepicker.css";
import "@/setupDatePickerLocale";                     // ③ locale kaydını tek yerde yaptık
import { useLanguage } from "../../contexts/LanguageContext";


function RouteSearchForm({ 
  locations, 
  searchData, 
  setSearchData, 
  onSearch,
  loading
}) {
  const { t } = useLanguage();
    // Yardımcı: string yerine Date nesnesi bekleyen DatePicker’a dönüştür
  const selectedDate = searchData.date ? searchData.date : null;

  
  return (
    <Card className="p-6">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.routes.from}
            </label>
            <select
              value={searchData.originLocationCode}
              onChange={(e) => setSearchData(prev => ({
                ...prev,
                originLocationCode: e.target.value
              }))}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">{t.routes.selectLocation}</option>
              {locations.map(location => (
                <option key={location.id} value={location.locationCode}>
                  {location.name} ({location.locationCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.routes.to}
            </label>
            <select
              value={searchData.destinationLocationCode}
              onChange={(e) => setSearchData(prev => ({
                ...prev,
                destinationLocationCode: e.target.value
              }))}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">{t.routes.selectLocation}</option>
              {locations.map(location => (
                <option key={location.id} value={location.locationCode}>
                  {location.name} ({location.locationCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.routes.date}
              </label>
            <DatePicker
              locale="tr-monday"                  // ④ Pazartesi sabit
              selected={selectedDate}
              onChange={(dt) =>
                setSearchData((prev) => ({
                  ...prev,
                  date: dt ? format(dt, "yyyy-MM-dd") : "",   // ⑤ ISO string
                }))
              }
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="yyyy-aa-gg"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              calendarStartDay={1}               // ⑥ ≥v5 prop’u; yedek olsun
              required
            />
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
  );
}

export default RouteSearchForm;