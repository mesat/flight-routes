// frontend/flight-route-ui/src/components/transportations/TransportationsManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';

import TransportationsList from './TransportationsList';
import TransportationForm from './TransportationForm';

// ⬇️ Artık tüm HTTP işlemleri ortak servis katmanından geliyor
import transportationService from '../../services/transportationService';

function TransportationsManagement() {
  const { t } = useLanguage();

  const [transportations, setTransportations] = useState([]);
  const [selected, setSelected] = useState(null);      // yeni / düzenlenecek kayıt
  const [error, setError] = useState('');

  /* -------------------------------------------------- */
  /*  Yardımcı fonksiyonlar                             */
  /* -------------------------------------------------- */
  const loadTransportations = useCallback(async () => {
    try {
      setError('');
      const data = await transportationService.getAllTransportations();
      setTransportations(data);
    } catch (err) {
      setError(err.message || t.errors.loadFailed);
    }
  }, [t.errors.loadFailed]);

  const handleCreate = async (dto) => {
    try {
      await transportationService.createTransportation(dto);
      await loadTransportations();
    } catch (err) {
      setError(err.message || t.errors.createFailed);
    }
  };

  const handleUpdate = async (id, dto) => {
    try {
      await transportationService.updateTransportation(id, dto);
      await loadTransportations();
    } catch (err) {
      setError(err.message || t.errors.updateFailed);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transportationService.deleteTransportation(id);
      await loadTransportations();
    } catch (err) {
      setError(err.message || t.errors.deleteFailed);
    }
  };

  /* -------------------------------------------------- */
  /*  Yaşam döngüsü                                     */
  /* -------------------------------------------------- */
  useEffect(() => {
    loadTransportations();
  }, [loadTransportations]);

  /* -------------------------------------------------- */
  /*  Görünüm                                           */
  /* -------------------------------------------------- */
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {t.transportations.title}
      </h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{t.common.error}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={() => setSelected({})} className="mb-4">
        {t.transportations.add}
      </Button>

      <TransportationsList
        transportations={transportations}
        onEdit={setSelected}
        onDelete={handleDelete}
      />

      {/* Modal formu; seçili kayıt varsa gösterilir */}
      {selected !== null && (
        <TransportationForm
          initialData={selected}
          onCancel={() => setSelected(null)}
          onSubmit={(dto) => {
            if (selected.id) {
              handleUpdate(selected.id, dto);
            } else {
              handleCreate(dto);
            }
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

export default TransportationsManagement;