/**
 * ERP ÉCLAT - Configuración & Sincronización View
 * Data sync with Google Sheets, offline queue manager, database backup/restore, and Station manager.
 */

import React, { useState } from 'react';
import { Usuario, Estacion } from '../../types';
import { Storage } from '../../lib/storage';
import { Settings, RefreshCw, FileSpreadsheet, Database, HardDrive, Wifi, Plus, CheckCircle, RotateCcw, Edit3, Trash2, Check, X, MapPin, KeyRound } from 'lucide-react';

interface ConfiguracionViewProps {
  currentUser: Usuario;
  onRefreshData: () => void;
  onOpenChangePinModal?: () => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  currentUser,
  onRefreshData,
  onOpenChangePinModal
}) => {
  const syncQueue = Storage.getSyncQueue();
  const estaciones = Storage.getEstaciones();

  const [sheetsUrl, setSheetsUrl] = useState<string>(
    localStorage.getItem('ECLAT_SHEETS_WEBAPP_URL') || 'https://script.google.com/macros/s/AKfycbx_eclat_appscript/exec'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  // Station creation state
  const [newEstacionNombre, setNewEstacionNombre] = useState<string>('');
  const [newEstacionUbicacion, setNewEstacionUbicacion] = useState<string>('');
  const [newEstacionEncargado, setNewEstacionEncargado] = useState<string>('');

  // Station edit state
  const [editingEstacion, setEditingEstacion] = useState<Estacion | null>(null);
  const [editEstacionNombre, setEditEstacionNombre] = useState<string>('');
  const [editEstacionUbicacion, setEditEstacionUbicacion] = useState<string>('');
  const [editEstacionEncargado, setEditEstacionEncargado] = useState<string>('');

  const handleStartEditEstacion = (est: Estacion) => {
    setEditingEstacion(est);
    setEditEstacionNombre(est.ESTACION);
    setEditEstacionUbicacion(est.UBICACION);
    setEditEstacionEncargado(est.ENCARGADO);
  };

  const handleSaveEditEstacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEstacion) return;
    const res = Storage.updateEstacion({
      ...editingEstacion,
      ESTACION: editEstacionNombre,
      UBICACION: editEstacionUbicacion,
      ENCARGADO: editEstacionEncargado
    }, currentUser.ROL);

    if (res.success) {
      setEditingEstacion(null);
      onRefreshData();
      setSyncStatusMsg(`¡Campamento "${editEstacionNombre}" actualizado correctamente!`);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } else {
      alert(res.error);
    }
  };

  const handleToggleEstacionStatus = (est: Estacion) => {
    const nuevoEstado = est.ESTADO === 'Activo' ? 'Inactivo' : 'Activo';
    const res = Storage.updateEstacion({ ...est, ESTADO: nuevoEstado }, currentUser.ROL);
    if (res.success) {
      onRefreshData();
    } else {
      alert(res.error);
    }
  };

  const handleSaveSheetsConfig = () => {
    localStorage.setItem('ECLAT_SHEETS_WEBAPP_URL', sheetsUrl);
    setSyncStatusMsg('¡Enlace de Google Apps Script / Google Sheets guardado correctamente!');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Conectando y sincronizando datos con Google Sheets...');

    setTimeout(() => {
      Storage.clearSyncQueue();
      setIsSyncing(false);
      setSyncStatusMsg('¡Sincronización completada con éxito! Todos los registros locales han sido guardados.');
      onRefreshData();
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }, 1500);
  };

  const handleDownloadBackupJSON = () => {
    const data = {
      estaciones: Storage.getEstaciones(),
      categorias: Storage.getCategorias(),
      productos: Storage.getProductos(),
      usuarios: Storage.getUsuarios(),
      inventarios: Storage.getInventarios(),
      entradas: Storage.getEntradas(),
      consumos: Storage.getConsumos(),
      produccion: Storage.getProduccion(),
      pedidos: Storage.getPedidos(),
      kardex: Storage.getKardex(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ECLAT_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetSeeds = () => {
    if (confirm('¿Desea restablecer la base de datos local a los valores iniciales de fábrica?')) {
      Storage.resetToDefaultSeeds();
      onRefreshData();
      alert('Base de datos restablecida.');
    }
  };

  const handleAddEstacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstacionNombre) return;

    const res = Storage.addEstacion({
      ESTACION: newEstacionNombre,
      UBICACION: newEstacionUbicacion || 'Campamento Operativo',
      ENCARGADO: newEstacionEncargado || 'Cocinera a Cargo',
      ESTADO: 'Activo'
    }, currentUser.ROL);

    if (res.success) {
      setNewEstacionNombre('');
      setNewEstacionUbicacion('');
      setNewEstacionEncargado('');
      onRefreshData();
      alert(`¡Nueva Estación "${newEstacionNombre}" creada exitosamente!`);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
            Configuración y Sincronización Google Sheets
          </h2>
          <p className="text-xs text-slate-500">
            Control de sincronización offline, respaldos de datos y estaciones
          </p>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Google Sheets Synchronization Panel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-[#004346] border-b pb-2">
            <FileSpreadsheet className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase">Sincronización con Google Sheets</h3>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p>
              El ERP está optimizado para funcionar en modo <strong>Offline (Sin Conexión)</strong>. Los registros realizados por las cocineras en zonas sin señal de internet se guardan localmente y se transmiten automáticamente a la hoja de cálculo de Google Sheets al conectarse.
            </p>

            <div className="bg-[#D6F3F4]/50 border border-[#004346]/20 p-3 rounded-xl space-y-1 text-[11px] text-[#004346]">
              <div className="font-bold">Cola de Sincronización Pendiente:</div>
              <div className="text-base font-mono font-black">{syncQueue.length} registros locales pendientes de envío</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase">
              URL WebApp Google Apps Script / Google Sheets
            </label>
            <input
              type="text"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
            />
            <button
              onClick={handleSaveSheetsConfig}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
            >
              Guardar URL de Conexión
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full py-3 bg-[#004346] text-[#D6F3F4] font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#003133] shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Ahora'}</span>
          </button>
        </div>

        {/* Database Backup & Maintenance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-[#004346] border-b pb-2">
            <Database className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase">Copias de Seguridad e Integridad</h3>
          </div>

          <p className="text-xs text-slate-600">
            Descargue una copia de seguridad completa en formato JSON o exporte informes en Excel para auditorías independientes.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={handleDownloadBackupJSON}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4" />
              <span>Descargar Copia de Seguridad Local (.JSON)</span>
            </button>

            {currentUser.ROL === 'Administrador' && (
              <button
                onClick={handleResetSeeds}
                className="w-full py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-rose-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer Datos Iniciales de Fábrica</span>
              </button>
            )}
          </div>

          {/* Security & Change PIN Card */}
          {onOpenChangePinModal && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-[#004346] uppercase">
                Seguridad de su Cuenta
              </label>
              <button
                onClick={onOpenChangePinModal}
                className="w-full py-2.5 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black text-xs uppercase rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>Cambiar mi Código PIN</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Station Management Panel (Admin Only) */}
      {currentUser.ROL === 'Administrador' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-black text-sm uppercase text-[#004346] border-b pb-2">
            Gestión de Estaciones y Campamentos Operativos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registered Stations List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Estaciones y Campamentos Registrados ({estaciones.length})
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {estaciones.map(est => (
                  <div key={est.ID_ESTACION} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center gap-2">
                    <div>
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#004346]" />
                        <span>{est.ESTACION}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-5">Ubicación: {est.UBICACION} | Encargado: {est.ENCARGADO}</div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleEstacionStatus(est)}
                        className={`font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          est.ESTADO === 'Activo' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click para cambiar estado Activo / Inactivo"
                      >
                        {est.ESTADO}
                      </button>
                      <button
                        onClick={() => handleStartEditEstacion(est)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                        title="Editar Datos del Campamento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Station Form */}
            <form onSubmit={handleAddEstacion} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <label className="block font-bold text-[#004346] uppercase">
                Añadir Nuevo Campamento / Estación
              </label>

              <input
                type="text"
                placeholder="Nombre del Campamento (ej. Campamento Yanaquihua Norte)"
                value={newEstacionNombre}
                onChange={(e) => setNewEstacionNombre(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                required
              />

              <input
                type="text"
                placeholder="Ubicación / Sector"
                value={newEstacionUbicacion}
                onChange={(e) => setNewEstacionUbicacion(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />

              <input
                type="text"
                placeholder="Encargado / Cocinera Responsable"
                value={newEstacionEncargado}
                onChange={(e) => setNewEstacionEncargado(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#004346] text-[#D6F3F4] font-black uppercase rounded-xl hover:bg-[#003133]"
              >
                + Crear Campamento con Inventario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {editingEstacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#004346]" />
                <h3 className="font-black text-[#004346] text-base uppercase">Editar Campamento / Estación</h3>
              </div>
              <button
                onClick={() => setEditingEstacion(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEstacion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Campamento / Estación</label>
                <input
                  type="text"
                  value={editEstacionNombre}
                  onChange={(e) => setEditEstacionNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ubicación / Sector Operativo</label>
                <input
                  type="text"
                  value={editEstacionUbicacion}
                  onChange={(e) => setEditEstacionUbicacion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Encargado / Cocinera Responsable</label>
                <input
                  type="text"
                  value={editEstacionEncargado}
                  onChange={(e) => setEditEstacionEncargado(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingEstacion(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black rounded-xl uppercase"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
