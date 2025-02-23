import React from 'react';
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@mui/material';

function LocationForm({
                          isOpen,
                          onClose,
                          onSubmit,
                          formData,
                          setFormData,
                          editingLocation,
                          t
                      }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingLocation ? t.locations.editLocation : t.locations.addLocation}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.locations.name}</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.locations.country}</label>
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    country: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.locations.city}</label>
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    city: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.locations.code}</label>
                            <Input
                                value={formData.locationCode}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    locationCode: e.target.value.toUpperCase()
                                }))}
                                required
                                placeholder="IST or CCIST"
                            />
                            <p className="text-sm text-gray-500">
                                {t.locations.codeHelp}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {t.locations.cancel}
                        </Button>
                        <Button type="submit">
                            {editingLocation ? t.locations.update : t.locations.create}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default LocationForm;