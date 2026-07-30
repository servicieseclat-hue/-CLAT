/**
 * ERP ÉCLAT - Kardex Audit Trail View
 * Automatic history of all entries, consumptions, and inventory adjustments.
 */

import React, { useState } from 'react';
import { Usuario, KardexEntry } from '../../types';
import { Storage } from '../../lib/storage';
import { exportKardexToExcel } from '../../lib/exportUtils';
import { History, FileSpreadsheet, Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface KardexViewProps {
  currentUser: Usuario;
  currentStation: string;
}

export const KardexView: React.FC<KardexViewProps> = ({
  currentUser,
  currentStation
}) => {
  const estaciones = Storage.getEstaciones();
  const productos = Storage.getProductos();

  const [selectedStation, setSelectedStation] = useState<string>(currentStation);
  const [selectedProducto, setSelectedProducto] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const kardexData = Storage.getKardex(selectedStation, selectedProducto);

  const filteredKardex = kardexData.filter(k => {
    const matchesSearch = k.PRODUCTO.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.REFERENCIA.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.USUARIO.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExportExcel = () => {
    const stationName = selectedStation === 'Todas' ? 'Todas_las_Estaciones' : selectedStation;
    exportKardexToExcel(filteredKardex, stationName);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Kardex Valorizado y Registro de Movimientos
            </h2>
            <p className="text-xs text-slate-500">
              Historial inalterable generado por entradas, consumos de cocina y ajustes
            </p>
          </div>
        </div>

        {currentUser.ROL === 'Administrador' && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Kardex a Excel</span>
          </button>
        )}
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
            placeholder="Buscar por insumo, usuario o guía..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
          />
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-[#004346] shrink-0" />
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas las Estaciones</option>
            {estaciones.map(e => <option key={e.ID_ESTACION} value={e.ID_ESTACION}>{e.ESTACION}</option>)}
          </select>
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <select
            value={selectedProducto}
            onChange={(e) => setSelectedProducto(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Productos</option>
            {productos.map(p => <option key={p.ID_PRODUCTO} value={p.ID_PRODUCTO}>{p.PRODUCTO}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#004346] text-[#D6F3F4] text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-3">Fecha / Hora</th>
                <th className="py-3 px-3">Estación</th>
                <th className="py-3 px-3">Producto</th>
                <th className="py-3 px-3 text-center">Tipo Mov.</th>
                <th className="py-3 px-3 text-right">Entradas</th>
                <th className="py-3 px-3 text-right">Salidas</th>
                <th className="py-3 px-3 text-right">Saldo Final</th>
                <th className="py-3 px-3">Usuario / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredKardex.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No existen registros de Kardex para la selección actual.
                  </td>
                </tr>
              ) : (
                filteredKardex.map((k) => (
                  <tr key={k.ID_KARDEX} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(k.FECHA_HORA).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{k.ESTACION}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{k.PRODUCTO} ({k.UNIDAD})</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        k.TIPO_MOVIMIENTO === 'ENTRADA' ? 'bg-emerald-100 text-emerald-900' :
                        k.TIPO_MOVIMIENTO === 'CONSUMO' || k.TIPO_MOVIMIENTO === 'PRODUCCION' ? 'bg-rose-100 text-rose-900' :
                        'bg-sky-100 text-sky-900'
                      }`}>
                        {k.TIPO_MOVIMIENTO === 'ENTRADA' ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                        {k.TIPO_MOVIMIENTO}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {k.CANTIDAD_ENTRADA > 0 ? `+${k.CANTIDAD_ENTRADA}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {k.CANTIDAD_SALIDA > 0 ? `-${k.CANTIDAD_SALIDA}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                      {k.SALDO_RESULTANTE}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="font-bold text-slate-800">{k.USUARIO.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">{k.REFERENCIA}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
