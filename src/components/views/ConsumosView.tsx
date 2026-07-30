/**
 * ERP ÉCLAT - Consumos / Salidas View
 * Register daily usage of food or cleaning supplies. Prevents negative stock & enforces 24h edit window lock.
 */

import React, { useState } from 'react';
import { Usuario, Consumo, Consumo as ConsumoType } from '../../types';
import { Storage, isRecordLocked } from '../../lib/storage';
import { TrendingDown, MinusCircle, AlertTriangle, CheckCircle, Lock, Trash2, Clock, Info } from 'lucide-react';

interface ConsumosViewProps {
  currentUser: Usuario;
  currentStation: string;
  onRefreshData: () => void;
}

export const ConsumosView: React.FC<ConsumosViewProps> = ({
  currentUser,
  currentStation,
  onRefreshData
}) => {
  const estaciones = Storage.getEstaciones();
  const productos = Storage.getProductos().filter(p => p.ACTIVO);
  const consumosRecientes = Storage.getConsumos(currentStation);

  const isCookLocked = currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas';
  const assignedStationId = isCookLocked ? currentUser.ESTACION_ASIGNADA : '';

  const [selectedStationId, setSelectedStationId] = useState<string>(
    isCookLocked ? assignedStationId : (currentStation !== 'Todas' ? currentStation : (estaciones[0]?.ID_ESTACION || 'EST-001'))
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(productos[0]?.ID_PRODUCTO || '');
  const [cantidad, setCantidad] = useState<string>('1');
  const [tipoConsumo, setTipoConsumo] = useState<ConsumoType['TIPO_CONSUMO']>('Cocina/Alimentación');
  const [observaciones, setObservaciones] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableEstaciones = isCookLocked
    ? estaciones.filter(e => e.ID_ESTACION === assignedStationId)
    : estaciones;

  const activeProduct = productos.find(p => p.ID_PRODUCTO === selectedProductId);
  const currentInvItem = Storage.getInventarios(selectedStationId).find(i => i.PRODUCTO_ID === selectedProductId);
  const currentStock = currentInvItem ? currentInvItem.STOCK_ACTUAL : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !selectedStationId) {
      setFeedback({ type: 'error', message: 'Seleccione un producto y estación válidos.' });
      return;
    }

    const cantNum = Number(cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      setFeedback({ type: 'error', message: 'Ingrese una cantidad positiva mayor a cero.' });
      return;
    }

    if (cantNum > currentStock) {
      setFeedback({
        type: 'error',
        message: `Stock insuficiente: El producto "${activeProduct.PRODUCTO}" solo cuenta con ${currentStock} ${activeProduct.UNIDAD} disponibles en esta estación.`
      });
      return;
    }

    const stationObj = estaciones.find(e => e.ID_ESTACION === selectedStationId);

    const res = Storage.addConsumo({
      FECHA_HORA: new Date().toISOString(),
      ESTACION_ID: selectedStationId,
      ESTACION: stationObj?.ESTACION || 'Estación',
      PRODUCTO_ID: activeProduct.ID_PRODUCTO,
      PRODUCTO: activeProduct.PRODUCTO,
      UNIDAD: activeProduct.UNIDAD,
      CANTIDAD: cantNum,
      TIPO_CONSUMO: tipoConsumo,
      OBSERVACIONES: observaciones,
      USUARIO: currentUser.NOMBRE
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Consumo de ${cantNum} ${activeProduct.UNIDAD} de "${activeProduct.PRODUCTO}" registrado exitosamente!`
      });
      setCantidad('1');
      setObservaciones('');
      onRefreshData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al registrar consumo.' });
    }
  };

  const handleDeleteConsumo = (consumoId: string, creadoEl: string) => {
    if (isRecordLocked(creadoEl, currentUser.ROL)) {
      alert('Registro bloqueado: Transcurrieron más de 24 horas desde su registro. Solo el Administrador puede revertir o modificar datos antiguos.');
      return;
    }

    if (confirm('¿Está seguro de eliminar este registro de consumo? El stock de producto se devolverá al almacén.')) {
      const res = Storage.deleteConsumo(consumoId, currentUser.ROL);
      if (res.success) {
        onRefreshData();
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Registro de Consumos y Salidas
            </h2>
            <p className="text-xs text-slate-500">
              Descuento directo de stock para cocina, preparación de comidas y limpieza de campamentos
            </p>
          </div>
        </div>

        {/* 24-hour Rule Notice */}
        <div className="hidden md:flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Regla ÉCLAT:</strong> Registros editables únicamente durante las primeras 24 horas.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Registration Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-[#004346] border-b pb-2 border-slate-200 flex items-center gap-2">
              <MinusCircle className="w-4 h-4 text-rose-600" />
              <span>Registrar Salida de Insumos</span>
            </h3>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Station */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                  <span>Estación / Campamento</span>
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
                  {availableEstaciones.map(e => (
                    <option key={e.ID_ESTACION} value={e.ID_ESTACION}>{e.ESTACION}</option>
                  ))}
                </select>
              </div>

              {/* Tipo Consumo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Uso / Tipo de Salida
                </label>
                <select
                  value={tipoConsumo}
                  onChange={(e) => setTipoConsumo(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#004346]"
                >
                  <option value="Cocina/Alimentación">Cocina / Preparación de Alimentos</option>
                  <option value="Limpieza">Servicios de Limpieza y Desinfección</option>
                  <option value="Mantenimiento">Mantenimiento de Campamento</option>
                  <option value="Merma/Pérdida">Merma / Pérdida por Caducidad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Product */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Seleccionar Insumo o Producto
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#004346]"
                >
                  {productos.map(p => (
                    <option key={p.ID_PRODUCTO} value={p.ID_PRODUCTO}>
                      [{p.CATEGORIA}] {p.PRODUCTO} ({p.UNIDAD})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity + Current Stock Indicator */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    Cantidad a Descontar
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    currentStock > 0 ? 'bg-slate-100 text-slate-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    Disponible: {currentStock} {activeProduct?.UNIDAD}
                  </span>
                </div>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  max={currentStock}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#004346]"
                  required
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Detalle / Observaciones del Servicio
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Almuerzo 50 raciones personal técnico, Limpieza pabellón B"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
              />
            </div>

            <button
              type="submit"
              disabled={currentStock <= 0}
              className={`w-full py-3 font-black uppercase text-xs tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                currentStock > 0
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <MinusCircle className="w-5 h-5" />
              <span>Confirmar y Descontar del Inventario</span>
            </button>
          </form>
        </div>

        {/* Consumos History List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-[#004346] mb-3 border-b pb-2 flex items-center justify-between">
            <span>Historial de Consumos</span>
            <span className="text-[10px] text-slate-400 font-normal">Estación: {currentStation}</span>
          </h3>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {consumosRecientes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No hay consumos registrados.
              </p>
            ) : (
              consumosRecientes.map((c) => {
                const isLocked = isRecordLocked(c.CREADO_EL, currentUser.ROL);

                return (
                  <div key={c.ID_CONSUMO} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{c.PRODUCTO}</span>
                      <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                        -{c.CANTIDAD} {c.UNIDAD}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{c.TIPO_CONSUMO}</span>
                      <span>{new Date(c.FECHA_HORA).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Reg: {c.USUARIO.split(' ')[0]}</span>

                      {/* 24h Lock Status & Action */}
                      <div className="flex items-center gap-1.5">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded" title="Bloqueado por pasar más de 24 horas">
                            <Lock className="w-3 h-3" /> Bloqueado 24h+
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteConsumo(c.ID_CONSUMO, c.CREADO_EL)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                            title="Eliminar consumo (dentro de las 24 horas)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
