/**
 * ERP ÉCLAT - Pedidos y Requerimientos View
 * Bulk table-based order builder with quantity inputs + Special order section + Restricted Excel export (Admin only).
 */

import React, { useState } from 'react';
import { Usuario, Pedido, Producto, ItemPedido } from '../../types';
import { Storage } from '../../lib/storage';
import { exportPedidoToExcel } from '../../lib/exportUtils';
import { ShoppingCart, FileSpreadsheet, Plus, CheckCircle, Clock, Check, X, Search, Filter, Edit3, FileText, AlertCircle } from 'lucide-react';

interface PedidosViewProps {
  currentUser: Usuario;
  currentStation: string;
  onRefreshData: () => void;
}

export const PedidosView: React.FC<PedidosViewProps> = ({
  currentUser,
  currentStation,
  onRefreshData
}) => {
  const estaciones = Storage.getEstaciones();
  const productos = Storage.getProductos().filter(p => p.ACTIVO);
  const categorias = Storage.getCategorias();
  const pedidos = Storage.getPedidos(currentStation);

  const isCookLocked = currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas';
  const assignedStationId = isCookLocked ? currentUser.ESTACION_ASIGNADA : '';

  const [selectedStationId, setSelectedStationId] = useState<string>(
    isCookLocked ? assignedStationId : (currentStation !== 'Todas' ? currentStation : (estaciones[0]?.ID_ESTACION || 'EST-001'))
  );

  const availableEstaciones = isCookLocked
    ? estaciones.filter(e => e.ID_ESTACION === assignedStationId)
    : estaciones;

  // Modal State for New Bulk Table Order Builder
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('Todas');
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [specialOrderText, setSpecialOrderText] = useState<string>('');
  const [generalObs, setGeneralObs] = useState<string>('Requerimiento periódico de insumos para cocina y limpieza');
  const [feedback, setFeedback] = useState<string>('');

  const currentStationObj = estaciones.find(e => e.ID_ESTACION === selectedStationId);

  // Auto-generate suggestion button
  const handleGenerateSuggestion = () => {
    const newPedido = Storage.generateSuggestedOrder(selectedStationId, currentUser.NOMBRE);
    if (newPedido) {
      setFeedback('¡Sugerencia de compra generada automáticamente basada en ítems con stock bajo!');
      onRefreshData();
      setTimeout(() => setFeedback(''), 4000);
    } else {
      alert('No hay productos por debajo del stock mínimo en esta estación.');
    }
  };

  // Quantity input handler
  const handleQtyChange = (prodId: string, val: string) => {
    const num = parseFloat(val);
    setOrderQuantities(prev => ({
      ...prev,
      [prodId]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  // Quick reset for modal quantities
  const handleClearQuantities = () => {
    setOrderQuantities({});
    setSpecialOrderText('');
  };

  // Save full table order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const items: ItemPedido[] = [];
    productos.forEach(p => {
      const qty = orderQuantities[p.ID_PRODUCTO] || 0;
      if (qty > 0) {
        const inv = Storage.getInventarios(selectedStationId).find(i => i.PRODUCTO_ID === p.ID_PRODUCTO);
        items.push({
          PRODUCTO_ID: p.ID_PRODUCTO,
          PRODUCTO: p.PRODUCTO,
          CATEGORIA: p.CATEGORIA,
          UNIDAD: p.UNIDAD,
          STOCK_ACTUAL: inv?.STOCK_ACTUAL || 0,
          STOCK_MINIMO: p.STOCK_MINIMO,
          CANTIDAD_SOLICITADA: qty,
          OBSERVACION_ITEM: ''
        });
      }
    });

    const hasSpecialText = specialOrderText.trim().length > 0;

    if (items.length === 0 && !hasSpecialText) {
      alert('Ingrese una cantidad a pedir en al menos un producto o escriba un requerimiento en el apartado de Pedido Especial.');
      return;
    }

    if (hasSpecialText) {
      items.push({
        PRODUCTO_ID: 'ESP-001',
        PRODUCTO: 'PEDIDO ESPECIAL / INSUMOS NO CATALOGADOS',
        CATEGORIA: 'Pedido Especial',
        UNIDAD: 'Unid',
        STOCK_ACTUAL: 0,
        STOCK_MINIMO: 0,
        CANTIDAD_SOLICITADA: 1,
        OBSERVACION_ITEM: specialOrderText.trim()
      });
    }

    const res = Storage.addPedido({
      FECHA_PEDIDO: new Date().toISOString().split('T')[0],
      ESTACION_ID: selectedStationId,
      ESTACION: currentStationObj?.ESTACION || 'Estación',
      SOLICITANTE: currentUser.NOMBRE,
      ESTADO: 'Pendiente',
      ORIGEN: currentUser.ROL === 'Cocinera' ? 'Manual por Cocinera' : 'Manual por Supervisor',
      ITEMS: items,
      OBSERVACIONES_GENERALES: hasSpecialText ? `Incluye Pedido Especial: ${specialOrderText.trim()}` : generalObs
    });

    if (res.success) {
      setFeedback('¡Pedido de insumos enviado correctamente a la administración!');
      setOrderQuantities({});
      setSpecialOrderText('');
      setShowOrderModal(false);
      onRefreshData();
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleUpdateStatus = (pedidoId: string, nuevoEstado: Pedido['ESTADO']) => {
    Storage.updatePedidoEstado(pedidoId, nuevoEstado, currentUser.NOMBRE);
    onRefreshData();
  };

  const handleDownloadExcel = (pedido: Pedido) => {
    exportPedidoToExcel(pedido);
  };

  // Filter products for the modal order table
  const filteredModalProductos = productos.filter(p => {
    const matchesSearch = p.PRODUCTO.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                          p.ID_PRODUCTO.toLowerCase().includes(modalSearchQuery.toLowerCase());
    const matchesCategory = modalCategoryFilter === 'Todas' || p.CATEGORIA === modalCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalSelectedItemsCount = (Object.values(orderQuantities) as number[]).filter(q => Number(q) > 0).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Gestión de Pedidos y Requerimientos de Compra
            </h2>
            <p className="text-xs text-slate-500">
              Tabla masiva de pedido directo, sugeridos por stock mínimo y pedidos especiales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Suggestion Button */}
          <button
            onClick={handleGenerateSuggestion}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Sugerir por Stock Bajo</span>
          </button>

          {/* New Order Modal Button */}
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-3.5 py-2 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Pedido</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Orders List Cards */}
      <div className="space-y-3">
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-medium border border-slate-200">
            No hay requerimientos o pedidos generados.
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.ID_PEDIDO} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#004346] text-sm">{pedido.ID_PEDIDO}</span>
                  <span className="text-xs font-semibold text-slate-600">({pedido.ESTACION})</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                    {pedido.ORIGEN}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    pedido.ESTADO === 'Aprobado' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                    pedido.ESTADO === 'Sugerido' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    pedido.ESTADO === 'Pendiente' ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {pedido.ESTADO}
                  </span>

                  {/* Excel Download Button - EXCLUSIVE TO ADMINISTRADOR */}
                  {currentUser.ROL === 'Administrador' && (
                    <button
                      onClick={() => handleDownloadExcel(pedido)}
                      className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all"
                      title="Descargar Pedido directamente en Excel (Exclusivo Administrador)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Descargar Excel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Meta */}
              <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                <div>Solicitante: <strong>{pedido.SOLICITANTE}</strong></div>
                <div>Fecha: <strong>{pedido.FECHA_PEDIDO}</strong></div>
                {pedido.APROBADO_POR && <div>Aprobado por: <strong>{pedido.APROBADO_POR}</strong></div>}
              </div>

              {/* Items Table */}
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="py-1 px-2">Producto</th>
                      <th className="py-1 px-2">Categoría</th>
                      <th className="py-1 px-2 text-center">Unidad</th>
                      <th className="py-1 px-2 text-right">Stock Actual</th>
                      <th className="py-1 px-2 text-right">Cantidad Requerida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pedido.ITEMS.map((item, idx) => (
                      <tr key={idx} className={item.PRODUCTO_ID === 'ESP-001' ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-1.5 px-2 font-bold text-slate-900">{item.PRODUCTO}</td>
                        <td className="py-1.5 px-2 text-slate-600">{item.CATEGORIA}</td>
                        <td className="py-1.5 px-2 text-center font-bold">{item.UNIDAD}</td>
                        <td className="py-1.5 px-2 text-right text-slate-500">{item.STOCK_ACTUAL}</td>
                        <td className="py-1.5 px-2 text-right font-black text-[#004346]">
                          {item.PRODUCTO_ID === 'ESP-001' ? '1 Detalle' : item.CANTIDAD_SOLICITADA}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Admin Approval Actions */}
              {(currentUser.ROL === 'Administrador' || currentUser.ROL === 'Supervisor') && pedido.ESTADO === 'Pendiente' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(pedido.ID_PEDIDO, 'Rechazado')}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rechazar</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(pedido.ID_PEDIDO, 'Aprobado')}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprobar Pedido</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Bulk Table Order Creation */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#004346] w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 shrink-0">
              <div className="flex items-center gap-2 text-[#004346]">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight">Tabla General de Pedido de Insumos</h3>
                  <p className="text-[11px] text-slate-500">Ingrese directamente los números requeridos por cada insumo</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Meta Info Header Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
                    <span>Estación Destino</span>
                    {isCookLocked && <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Asignada</span>}
                  </label>
                  <select
                    value={isCookLocked ? assignedStationId : selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    disabled={isCookLocked}
                    className={`w-full p-2 border rounded-xl font-semibold text-slate-900 ${
                      isCookLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white border-slate-300'
                    }`}
                  >
                    {availableEstaciones.map(e => <option key={e.ID_ESTACION} value={e.ID_ESTACION}>{e.ESTACION}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Solicitante</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.NOMBRE}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Resumen de Selección</label>
                  <div className="p-2 bg-[#D6F3F4] text-[#004346] rounded-xl font-bold flex items-center justify-between">
                    <span>{totalSelectedItemsCount} productos listados</span>
                    {totalSelectedItemsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearQuantities}
                        className="text-[10px] text-rose-700 hover:underline"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre de producto..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                  <Filter className="w-4 h-4 text-[#004346] shrink-0" />
                  <select
                    value={modalCategoryFilter}
                    onChange={(e) => setModalCategoryFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Todas">Todas las Categorías</option>
                    {categorias.map(c => <option key={c.ID_CATEGORIA} value={c.CATEGORIA}>{c.CATEGORIA}</option>)}
                  </select>
                </div>
              </div>

              {/* Interactive Bulk Product Quantities Table */}
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#004346] text-[#D6F3F4] text-[10px] font-black uppercase z-10">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Producto / Insumo</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3 text-center">Unidad</th>
                      <th className="py-2.5 px-3 text-right">Stock Act.</th>
                      <th className="py-2.5 px-3 text-right">Stock Mín.</th>
                      <th className="py-2.5 px-3 text-center bg-[#003133] border-l border-[#005c60]">Cantidad a Pedir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredModalProductos.map((p) => {
                      const qty = orderQuantities[p.ID_PRODUCTO] || '';
                      const inv = Storage.getInventarios(selectedStationId).find(i => i.PRODUCTO_ID === p.ID_PRODUCTO);
                      const isSelected = Number(qty) > 0;

                      return (
                        <tr
                          key={p.ID_PRODUCTO}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-amber-50/80 font-bold' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{p.ID_PRODUCTO}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{p.PRODUCTO}</td>
                          <td className="py-2 px-3 text-slate-600">{p.CATEGORIA}</td>
                          <td className="py-2 px-3 text-center font-bold text-[#004346]">{p.UNIDAD}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{inv?.STOCK_ACTUAL || 0}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">{p.STOCK_MINIMO}</td>
                          <td className="py-2 px-3 text-center bg-slate-50/80 border-l border-slate-200">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0"
                              value={qty}
                              onChange={(e) => handleQtyChange(p.ID_PRODUCTO, e.target.value)}
                              className={`w-24 p-1.5 text-center font-mono font-black text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#004346] ${
                                isSelected
                                  ? 'bg-[#004346] text-[#D6F3F4] border-[#004346]'
                                  : 'bg-white text-slate-900 border-slate-300'
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Apartado de Pedido Especial (Special Order Section) */}
              <div className="bg-amber-50/80 border border-amber-300 p-3 rounded-2xl space-y-1.5 shrink-0">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Apartado de Pedido Especial (Insumos o requerimientos no catalogados)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Si necesita un producto que no figura en la lista superior, escríbalo a continuación detallando la cantidad y especificación:
                </p>
                <textarea
                  value={specialOrderText}
                  onChange={(e) => setSpecialOrderText(e.target.value)}
                  rows={2}
                  placeholder="Ej. 2 Cajas de cera líquida especial para pisos, 5 Kilos de sazonador criollo, 1 Juego de cacerolas de repuesto..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#004346]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#004346] text-[#D6F3F4] font-black uppercase text-xs rounded-xl hover:bg-[#003133] shadow-md transition-all"
                >
                  Enviar Requerimiento General ({totalSelectedItemsCount + (specialOrderText.trim() ? 1 : 0)} ítems)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
