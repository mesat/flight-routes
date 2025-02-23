import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

function RouteSearchForm({
                             locations,
                             searchData,
                             setSearchData,
                             onSearch,
                             loading,
                             t
                         }) {
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
                        <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={searchData.date}
                            onChange={(e) => setSearchData(prev => ({
                                ...prev,
                                date: e.target.value
                            }))}
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