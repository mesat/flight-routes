import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function TransportationForm({
                                isOpen,
                                onClose,
                                onSubmit,
                                formData,
                                setFormData,
                                locations,
                                editingTransportation,
                                t
                            }) {
    const transportationTypes = ['FLIGHT', 'BUS', 'SUBWAY', 'UBER'];
    const days = [
        { id: 1, name: 'Pazartesi' },
        { id: 2, name: 'Salı' },
        { id: 3, name: 'Çarşamba' },
        { id: 4, name: 'Perşembe' },
        { id: 5, name: 'Cuma' },
        { id: 6, name: 'Cumartesi' },
        { id: 7, name: 'Pazar' }
    ];

    const toggleDay = (dayId) => {
        setFormData(prev => ({
            ...prev,
            operatingDays: prev.operatingDays.includes(dayId)
                ? prev.operatingDays.filter(d => d !== dayId)
                : [...prev.operatingDays, dayId].sort()
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingTransportation ? t.transportations.editTransportation : t.transportations.addTransportation}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.transportations.from}</label>
                            <select
                                value={formData.originLocationId}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    originLocationId: e.target.value
                                }))}
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">{t.transportations.selectLocation}</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} ({location.locationCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.transportations.to}</label>
                            <select
                                value={formData.destinationLocationId}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    destinationLocationId: e.target.value
                                }))}
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">{t.transportations.selectLocation}</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} ({location.locationCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.transportations.type}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {transportationTypes.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, transportationType: type }))}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            formData.transportationType === type
                                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.transportations.operatingDays}</label>
                            <div className="grid grid-cols-7 gap-1">
                                {days.map(day => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`p-2 text-center text-sm rounded-md ${
                                            formData.operatingDays.includes(day.id)
                                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.name.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            {formData.operatingDays.length === 0 && (
                                <p className="text-sm text-red-500">
                                    {t.transportations.selectDays}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {t.transportations.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={formData.operatingDays.length === 0}
                        >
                            {editingTransportation ? t.transportations.update : t.transportations.create}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default TransportationForm;