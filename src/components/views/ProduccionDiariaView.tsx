/**
 * ERP ÉCLAT - Producción Diaria de Catering View
 * Record daily meals (Desayuno, Almuerzo, Cena) headcount & recipes.
 * Automatically deducts ingredients and enforces 24h edit lock rule.
 */

import React, { useState } from 'react';
import { Usuario, ProduccionDiaria, Producto, ItemReceta, UnidadMedida } from '../../types';
import { Storage, isRecordLocked } from '../../lib/storage';
import { UtensilsCrossed, Plus, Trash2, CheckCircle, AlertCircle, Users, Lock, Clock } from 'lucide-react';

interface ProduccionDiariaViewProps {
  currentUser: Usuario;
  currentStation: string;
  onRefreshData: () => void;
}

export const ProduccionDiariaView: React.FC<ProduccionDiariaViewProps> = ({
  currentUser,
  currentStation,
  onRefreshData
}) => {
  const estaciones = Storage.getEstaciones();
  const productos = Storage.getProductos().filter(p => p.ACTIVO);
  const produccionesRecientes = Storage.getProduccion(currentStation);

  const isCookLocked = currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas';
  const assignedStationId = isCookLocked ? currentUser.ESTACION_ASIGNADA : '';

  const [selectedStationId, setSelectedStationId] = useState<string>(
    isCookLocked ? assignedStationId : (currentStation !== 'Todas' ? currentStation : (estaciones[0]?.ID_ESTACION || 'EST-001'))
  );
  const [servicio, setServicio] = useState<ProduccionDiaria['SERVICIO']>('Almuerzo');

  const availableEstaciones = isCookLocked
    ? estaciones.filter(e => e.ID_ESTACION === assignedStationId)
    : estaciones;
  const [cantidadPersonas, setCantidadPersonas] = useState<number>(50);
  const [menuDescripcion, setMenuDescripcion] = useState<string>('Lomo Saltado con Arroz Extra, Papa frita y Refresco');
  const [observaciones, setObservaciones] = useState<string>('');

  // Selected recipe / ingredient items for this meal service
  const [ingredientItems, setIngredientItems] = useState<{
    productoId: string;
    cantidad: number;
  }[]>([
    { productoId: productos[0]?.ID_PRODUCTO || 'PRD-001', cantidad: 8 },
    { productoId: productos[3]?.ID_PRODUCTO || 'PRD-004', cantidad: 1 },
    { productoId: productos[9]?.ID_PRODUCTO || 'PRD-010', cantidad: 1 }
  ]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddIngredientRow = () => {
    setIngredientItems([
      ...ingredientItems,
      { productoId: productos[0]?.ID_PRODUCTO || 'PRD-001', cantidad: 1 }
    ]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setIngredientItems(ingredientItems.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: 'productoId' | 'cantidad', value: any) => {
    const updated = [...ingredientItems];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStationId) {
      setFeedback({ type: 'error', message: 'Seleccione una estación de campamento.' });
      return;
    }

    if (ingredientItems.length === 0) {
      setFeedback({ type: 'error', message: 'Añada al menos un ingrediente o insumo consumido.' });
      return;
    }

    const stationObj = estaciones.find(e => e.ID_ESTACION === selectedStationId);

    // Build associated consumption items
    const consumosAsociados = ingredientItems.map(item => {
      const prd = productos.find(p => p.ID_PRODUCTO === item.productoId);
      return {
        PRODUCTO_ID: item.productoId,
        PRODUCTO: prd?.PRODUCTO || 'Insumo',
        UNIDAD: (prd?.UNIDAD || 'Unid') as UnidadMedida,
        CANTIDAD_UTILIZADA: Number(item.cantidad)
      };
    });

    const res = Storage.addProduccionDiaria({
      FECHA: new Date().toISOString().split('T')[0],
      HORA_REGISTRO: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ESTACION_ID: selectedStationId,
      ESTACION: stationObj?.ESTACION || 'Estación',
      SERVICIO: servicio,
      CANTIDAD_PERSONAS: Number(cantidadPersonas),
      MENU_DESCRIPCION: menuDescripcion,
      CONSUMOS_ASOCIADOS: consumosAsociados,
      OBSERVACIONES: observaciones,
      USUARIO: currentUser.NOMBRE
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `¡Producción de ${servicio} (${cantidadPersonas} raciones) guardada con éxito! Insumos descontados.`
      });
      setMenuDescripcion('');
      setObservaciones('');
      onRefreshData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al guardar producción.' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Producción Diaria de Catering y Raciones
            </h2>
            <p className="text-xs text-slate-500">
              Registro diario de minutas (Desayuno, Almuerzo, Cena) y descuento automático de insumos
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Restricción:</strong> Edición bloqueada tras 24 horas del registro.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Production Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-[#004346] border-b pb-2 border-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#004346]" />
              <span>Registro de Servicio y Comensales</span>
            </h3>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Estación */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                  <span>Estación</span>
                  {isCookLocked && <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1 py-0.5 rounded">Asignada</span>}
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

              {/* Servicio */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Servicio de Comida
                </label>
                <select
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#004346]"
                >
                  <option value="Desayuno">Desayuno</option>
                  <option value="Almuerzo">Almuerzo</option>
                  <option value="Cena">Cena</option>
                  <option value="Refrigerio/Snack">Refrigerio / Snack</option>
                  <option value="Especial">Servicio Especial</option>
                </select>
              </div>

              {/* Personas Atendidas */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  N° Raciones / Personas
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#004346]"
                  required
                />
              </div>
            </div>

            {/* Menú Preparado */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Descripción del Menú / Minuta
              </label>
              <input
                type="text"
                value={menuDescripcion}
                onChange={(e) => setMenuDescripcion(e.target.value)}
                placeholder="Ej. Seco de Pollo con frijoles, arroz, ensalada mixta y refresco de chicha"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
                required
              />
            </div>

            {/* Insumos Utilizados */}
            <div className="bg-[#D6F3F4]/30 border border-[#004346]/20 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-[#004346]/20">
                <span className="text-xs font-black uppercase text-[#004346]">
                  Insumos / Ingredientes Consumidos
                </span>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="flex items-center gap-1 text-[11px] font-bold bg-[#004346] text-[#D6F3F4] px-2.5 py-1 rounded-lg hover:bg-[#003133]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Insumo</span>
                </button>
              </div>

              <div className="space-y-2">
                {ingredientItems.map((item, idx) => {
                  const prd = productos.find(p => p.ID_PRODUCTO === item.productoId);

                  return (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                      <select
                        value={item.productoId}
                        onChange={(e) => handleIngredientChange(idx, 'productoId', e.target.value)}
                        className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        {productos.map(p => (
                          <option key={p.ID_PRODUCTO} value={p.ID_PRODUCTO}>
                            {p.PRODUCTO} ({p.UNIDAD})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.cantidad}
                          onChange={(e) => handleIngredientChange(idx, 'cantidad', Number(e.target.value))}
                          className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                        />
                        <span className="text-[10px] font-bold text-slate-600 w-10">
                          {prd?.UNIDAD || 'Unid'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#004346] text-[#D6F3F4] font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#003133] shadow-md transition-all active:scale-95"
            >
              Guardar Producción y Descontar Stock
            </button>
          </form>
        </div>

        {/* Producciones Recientes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-[#004346] mb-3 border-b pb-2 flex justify-between items-center">
            <span>Raciones Registradas</span>
            <span className="text-[10px] text-slate-400">Estación: {currentStation}</span>
          </h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {produccionesRecientes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No hay registros de producción recientes.
              </p>
            ) : (
              produccionesRecientes.map((p) => {
                const isLocked = isRecordLocked(p.CREADO_EL, currentUser.ROL);

                return (
                  <div key={p.ID_PRODUCCION} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-black text-slate-900">
                      <span className="text-[#004346]">{p.SERVICIO} ({p.CANTIDAD_PERSONAS} pers.)</span>
                      <span className="text-[10px] text-slate-500 font-normal">{p.FECHA}</span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-800 line-clamp-2">
                      {p.MENU_DESCRIPCION}
                    </div>

                    <div className="text-[10px] text-slate-500 bg-white p-1.5 rounded border border-slate-100">
                      <strong>Insumos:</strong> {p.CONSUMOS_ASOCIADOS.map(c => `${c.PRODUCTO} (${c.CANTIDAD_UTILIZADA} ${c.UNIDAD})`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Cocinera: {p.USUARIO.split(' ')[0]}</span>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
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
