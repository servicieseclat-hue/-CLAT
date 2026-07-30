/**
 * ERP ÉCLAT - Entradas (Recepción de Productos) View
 * Register incoming inventory stock, increase station stock, write Kardex entry.
 */

import React, { useState } from 'react';
import { Usuario, Entrada, Producto } from '../../types';
import { Storage } from '../../lib/storage';
import { ArrowDownCircle, Plus, CheckCircle, AlertCircle, History, PackageCheck } from 'lucide-react';

interface EntradasViewProps {
  currentUser: Usuario;
  currentStation: string;
  onRefreshData: () => void;
}

export const EntradasView: React.FC<EntradasViewProps> = ({
  currentUser,
  currentStation,
  onRefreshData
}) => {
  const estaciones = Storage.getEstaciones();
  const productos = Storage.getProductos().filter(p => p.ACTIVO);
  const entradasRecientes = Storage.getEntradas(currentStation);

  const isCookLocked = currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas';
  const assignedStationId = isCookLocked ? currentUser.ESTACION_ASIGNADA : '';

  const [selectedStationId, setSelectedStationId] = useState<string>(
    isCookLocked ? assignedStationId : (currentStation !== 'Todas' ? currentStation : (estaciones[0]?.ID_ESTACION || 'EST-001'))
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(productos[0]?.ID_PRODUCTO || '');
  const [cantidad, setCantidad] = useState<string>('10');
  const [proveedor, setProveedor] = useState<string>('Distribuidora Central ÉCLAT');
  const [observaciones, setObservaciones] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeProduct = productos.find(p => p.ID_PRODUCTO === selectedProductId);

  const availableEstaciones = isCookLocked
    ? estaciones.filter(e => e.ID_ESTACION === assignedStationId)
    : estaciones;

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStationId = isCookLocked ? assignedStationId : selectedStationId;

    if (!activeProduct || !effectiveStationId) {
      setFeedback({ type: 'error', message: 'Seleccione un producto y una estación válidos.' });
      return;
    }

    const cantNum = Number(cantidad);

    if (isNaN(cantNum) || cantNum <= 0) {
      setFeedback({ type: 'error', message: 'Ingrese una cantidad válida mayor a cero.' });
      return;
    }

    const stationObj = estaciones.find(e => e.ID_ESTACION === effectiveStationId);

    const res = Storage.addEntrada({
      FECHA_HORA: new Date().toISOString(),
      ESTACION_ID: effectiveStationId,
      ESTACION: stationObj?.ESTACION || 'Estación',
      PRODUCTO_ID: activeProduct.ID_PRODUCTO,
      PRODUCTO: activeProduct.PRODUCTO,
      UNIDAD: activeProduct.UNIDAD,
      CANTIDAD: cantNum,
      COSTO_UNITARIO: 0,
      COSTO_TOTAL: 0,
      PROVEEDOR: proveedor,
      OBSERVACIONES: observaciones,
      USUARIO: currentUser.NOMBRE
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Recepción de ${cantNum} ${activeProduct.UNIDAD} de "${activeProduct.PRODUCTO}" guardada exitosamente! Stock actualizado.`
      });
      setCantidad('10');
      setObservaciones('');
      onRefreshData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al guardar la entrada.' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="p-2.5 bg-[#D6F3F4] text-[#004346] rounded-xl">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
            Recepción e Ingreso de Productos (Entradas)
          </h2>
          <p className="text-xs text-slate-500">
            Registra abastecimiento de proveedores o traslados hacia almacén de estación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-[#004346] border-b pb-2 border-slate-200 flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              <span>Formulario de Recepción de Mercadería</span>
            </h3>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Station Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                  <span>Estación / Campamento Destino</span>
                  {isCookLocked && <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Asignada</span>}
                </label>
                <select
                  value={isCookLocked ? assignedStationId : selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  disabled={isCookLocked}
                  className={`w-full p-2.5 border rounded-xl text-xs font-semibold ${
                    isCookLocked ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed' : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-[#004346]'
                  }`}
                >
                  {availableEstaciones.map(est => (
                    <option key={est.ID_ESTACION} value={est.ID_ESTACION}>{est.ESTACION}</option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Producto / Insumo
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#004346]"
                >
                  {productos.map(p => (
                    <option key={p.ID_PRODUCTO} value={p.ID_PRODUCTO}>
                      [{p.CATEGORIA}] {p.PRODUCTO} ({p.UNIDAD})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Cantidad A Ingresar ({activeProduct?.UNIDAD || 'Unid'})
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ingrese la cantidad recepcionada..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#004346]"
                required
              />
            </div>

            {/* Proveedor & Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Proveedor / Origen
                </label>
                <input
                  type="text"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Ej. Distribuidora ÉCLAT Central"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Observaciones / N° Guía de Remisión
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej. Guía N° 001-4820, empaque sellado"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#004346] text-[#D6F3F4] font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#003133] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Ingreso y Actualizar Stock</span>
            </button>
          </form>
        </div>

        {/* Recent Entries List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-[#004346] mb-3 flex items-center gap-1.5 border-b pb-2">
            <History className="w-4 h-4" />
            <span>Últimos Ingresos Registrados</span>
          </h3>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {entradasRecientes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No hay ingresos registrados recientemente.
              </p>
            ) : (
              entradasRecientes.slice(0, 8).map((ent) => (
                <div key={ent.ID_ENTRADA} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{ent.PRODUCTO}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      +{ent.CANTIDAD} {ent.UNIDAD}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Estación: <strong>{ent.ESTACION}</strong></span>
                    <span>{new Date(ent.FECHA_HORA).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Prov: {ent.PROVEEDOR} | Reg: {ent.USUARIO.split(' ')[0]}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
