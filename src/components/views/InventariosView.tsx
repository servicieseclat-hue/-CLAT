/**
 * ERP ÉCLAT - Inventarios View
 * Stock control by station, category filter, low stock alert, and manual stock adjustment (Admin only).
 */

import React, { useState } from 'react';
import { Inventario, Usuario, Categoria } from '../../types';
import { Storage } from '../../lib/storage';
import { exportInventarioToExcel } from '../../lib/exportUtils';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  CheckCircle,
  PlusCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface InventariosViewProps {
  currentUser: Usuario;
  currentStation: string;
  onRefreshData: () => void;
}

export const InventariosView: React.FC<InventariosViewProps> = ({
  currentUser,
  currentStation,
  onRefreshData
}) => {
  const inventarios = Storage.getInventarios(currentStation);
  const categorias = Storage.getCategorias();
  const estaciones = Storage.getEstaciones();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [filterStockStatus, setFilterStockStatus] = useState<'Todos' | 'Critico' | 'Normal'>('Todos');

  // Modal for Manual Stock Adjustment (Admin only)
  const [adjustItem, setAdjustItem] = useState<Inventario | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustError, setAdjustError] = useState<string>('');
  const [adjustSuccess, setAdjustSuccess] = useState<string>('');

  const currentStationObj = estaciones.find(e => e.ID_ESTACION === currentStation);
  const stationName = currentStation === 'Todas' ? 'Todas las Estaciones' : (currentStationObj?.ESTACION || 'Estación');

  // Filtered inventory
  const filteredInventarios = inventarios.filter(inv => {
    const matchesSearch = inv.PRODUCTO.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.CATEGORIA.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || inv.CATEGORIA === selectedCategory;
    const matchesStock = filterStockStatus === 'Todos' ||
      (filterStockStatus === 'Critico' && inv.STOCK_ACTUAL < inv.STOCK_MINIMO) ||
      (filterStockStatus === 'Normal' && inv.STOCK_ACTUAL >= inv.STOCK_MINIMO);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = inventarios.filter(i => i.STOCK_ACTUAL < i.STOCK_MINIMO).length;

  const handleOpenAdjust = (item: Inventario) => {
    setAdjustItem(item);
    setNewStockInput(item.STOCK_ACTUAL);
    setAdjustReason('Inventario Físico / Arqueo de Almacén');
    setAdjustError('');
    setAdjustSuccess('');
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    const res = Storage.adjustStockManual(
      adjustItem.ESTACION_ID,
      adjustItem.PRODUCTO_ID,
      Number(newStockInput),
      adjustReason,
      currentUser.NOMBRE,
      currentUser.ROL
    );

    if (res.success) {
      setAdjustSuccess('Ajuste de inventario registrado correctamente en el Kardex.');
      onRefreshData();
      setTimeout(() => {
        setAdjustItem(null);
      }, 1200);
    } else {
      setAdjustError(res.error || 'Error al ajustar el inventario');
    }
  };

  const handleExportExcel = () => {
    exportInventarioToExcel(filteredInventarios, stationName);
  };

  return (
    <div className="space-[#D6F3F4] space-y-4">
      {/* Top Banner Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#004346]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#004346]">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Control de Inventario - {stationName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Vista de existencias por producto, categoría y alertas de reposición
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Low Stock Warning Badge */}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-sm animate-bounce">
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStockCount} ítems por debajo del mínimo</span>
            </div>
          )}

          {currentUser.ROL === 'Administrador' && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto o código..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#004346]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-[#004346] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.ID_CATEGORIA} value={cat.CATEGORIA}>{cat.CATEGORIA}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center justify-around bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterStockStatus('Todos')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterStockStatus === 'Todos' ? 'bg-[#004346] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos ({inventarios.length})
          </button>
          <button
            onClick={() => setFilterStockStatus('Critico')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterStockStatus === 'Critico' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            Bajo Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#004346] text-[#D6F3F4] text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-3">Estación</th>
                <th className="py-3 px-3">Producto / Insumo</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-center">Unidad</th>
                <th className="py-3 px-3 text-right">Stock Actual</th>
                <th className="py-3 px-3 text-right">Stock Mín.</th>
                <th className="py-3 px-3 text-center">Estado</th>
                {currentUser.ROL === 'Administrador' && (
                  <th className="py-3 px-3 text-center">Acción (Admin)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInventarios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron productos registrados para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredInventarios.map((inv) => {
                  const isLowStock = inv.STOCK_ACTUAL < inv.STOCK_MINIMO;

                  return (
                    <tr
                      key={inv.ID_INVENTARIO}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLowStock ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {inv.ESTACION}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {inv.PRODUCTO}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                          {inv.CATEGORIA}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {inv.UNIDAD}
                      </td>
                      <td className={`py-3 px-3 text-right font-black text-sm ${
                        isLowStock ? 'text-amber-700' : 'text-slate-900'
                      }`}>
                        {inv.STOCK_ACTUAL}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-500">
                        {inv.STOCK_MINIMO}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            REPOSICIÓN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                            NORMAL
                          </span>
                        )}
                      </td>

                      {/* Admin Adjust Button */}
                      {currentUser.ROL === 'Administrador' && (
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenAdjust(inv)}
                            className="px-2.5 py-1 bg-[#004346] hover:bg-[#003133] text-white text-[10px] font-bold rounded-lg shadow-xs transition-all"
                            title="Ajuste manual de stock por Administrador"
                          >
                            Ajustar Stock
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Manual Stock Adjustment */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#004346] w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2 text-[#004346]">
                <Edit className="w-5 h-5" />
                <h3 className="font-black text-base uppercase">Ajuste Directo de Stock</h3>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#D6F3F4]/50 p-3 rounded-xl text-xs space-y-1 text-[#004346]">
              <div><strong>Estación:</strong> {adjustItem.ESTACION}</div>
              <div><strong>Producto:</strong> {adjustItem.PRODUCTO} ({adjustItem.UNIDAD})</div>
              <div><strong>Stock Actual en Sistema:</strong> {adjustItem.STOCK_ACTUAL}</div>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Nuevo Stock Físico Verificado
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004346]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Motivo o Justificación del Ajuste
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej. Inventario físico, mermas por caducidad, corrección"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#004346]"
                  required
                />
              </div>

              {adjustError && (
                <div className="p-2 bg-rose-100 text-rose-800 text-xs rounded-lg font-medium">
                  {adjustError}
                </div>
              )}

              {adjustSuccess && (
                <div className="p-2 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{adjustSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004346] text-[#D6F3F4] font-black text-xs uppercase rounded-xl hover:bg-[#003133]"
                >
                  Guardar Ajuste y Registrar Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
