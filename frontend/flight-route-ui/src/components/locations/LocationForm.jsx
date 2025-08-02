import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '../../contexts/LanguageContext';

function LocationForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  editingLocation 
}) {
  const { t } = useLanguage();
  
  // Güvenli prop kontrolleri
  const safeFormData = formData || {};
  const isEditing = !!editingLocation;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.locations.editLocation : t.locations.addLocation}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t.locations.editLocationDesc : t.locations.addLocationDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.locations.name}</label>
              <Input
                value={safeFormData.name || ''}
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
                value={safeFormData.country || ''}
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
                value={safeFormData.city || ''}
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
                value={safeFormData.locationCode || ''}
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
          
          {/* Fixing the DialogFooter issue by using a div instead */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-20"
            >
              {t.locations.cancel}
            </Button>
            <Button type="submit" className="w-20">
              {isEditing ? t.locations.update : t.locations.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LocationForm;