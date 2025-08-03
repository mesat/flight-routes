import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
        { id: 1, name: t.days[1] },
        { id: 2, name: t.days[2] },
        { id: 3, name: t.days[3] },
        { id: 4, name: t.days[4] },
        { id: 5, name: t.days[5] },
        { id: 6, name: t.days[6] },
        { id: 7, name: t.days[7] }
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
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {editingTransportation ? t.transportations.editTransportation : t.transportations.addTransportation}
                    </DialogTitle>
                    <DialogDescription>
                        {editingTransportation ? t.transportations.editTransportationDesc : t.transportations.addTransportationDesc}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(formData);
                }}>
                    <div className="space-y-3 lg:space-y-4 py-2 lg:py-4">
                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-sm font-medium">{t.transportations.from}</label>
                            <select
                                value={formData.originLocationId || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    originLocationId: e.target.value
                                }))}
                                required
                                className="w-full rounded-md border border-gray-300 px-2 lg:px-3 py-2 text-sm"
                            >
                                <option value="">{t.transportations.selectLocation}</option>
                                {locations && locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} ({location.locationCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-sm font-medium">{t.transportations.to}</label>
                            <select
                                value={formData.destinationLocationId || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    destinationLocationId: e.target.value
                                }))}
                                required
                                className="w-full rounded-md border border-gray-300 px-2 lg:px-3 py-2 text-sm"
                            >
                                <option value="">{t.transportations.selectLocation}</option>
                                {locations && locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} ({location.locationCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-sm font-medium">{t.transportations.type}</label>
                            <div className="grid grid-cols-2 gap-1 lg:gap-2">
                                {transportationTypes.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, transportationType: type }))}
                                        className={`px-2 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium ${
                                            formData.transportationType === type
                                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {t.transportationTypes[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-sm font-medium">{t.transportations.operatingDays}</label>
                            <div className="grid grid-cols-7 gap-1">
                                {days.map(day => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`p-1 lg:p-2 text-center text-xs lg:text-sm rounded-md ${
                                            formData.operatingDays && formData.operatingDays.includes(day.id)
                                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.name.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            {(!formData.operatingDays || formData.operatingDays.length === 0) && (
                                <p className="text-xs lg:text-sm text-red-500">
                                    {t.transportations.selectDays}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-3 lg:mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-16 lg:w-20 text-xs lg:text-sm"
                        >
                            {t.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formData.operatingDays || formData.operatingDays.length === 0}
                            className="w-16 lg:w-20 text-xs lg:text-sm"
                        >
                            {editingTransportation ? t.common.update : t.common.create}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default TransportationForm;