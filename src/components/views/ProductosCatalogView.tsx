/**
 * ERP ÉCLAT - Product Catalog View
 * Admin-only product creation/editing + Read-only catalog for cooks and supervisors.
 */

import React, { useState } from 'react';
import { Usuario, Producto, Categoria, UnidadMedida } from '../../types';
import { Storage } from '../../lib/storage';
import { ListFilter, Plus, Edit, Trash2, Lock, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

interface ProductosCatalogViewProps {
  currentUser: Usuario;
  onRefreshData: () => void;
}

export const ProductosCatalogView: React.FC<ProductosCatalogViewProps> = ({
  currentUser,
  onRefreshData
}) => {
  const productos = Storage.getProductos();
  const categorias = Storage.getCategorias();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Adding/Editing Product
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const [prodNombre, setProdNombre] = useState<string>('');
  const [prodCategoria, setProdCategoria] = useState<string>(categorias[0]?.CATEGORIA || 'Carnes y Aves');
  const [prodUnidad, setProdUnidad] = useState<UnidadMedida>('Kg');
  const [stockMin, setStockMin] = useState<number>(10);
  const [stockMax, setStockMax] = useState<number>(50);
  const [costoRef, setCostoRef] = useState<number>(15.00);

  const [feedback, setFeedback] = useState<string>('');

  const canEdit = currentUser.ROL === 'Administrador';

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.PRODUCTO.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.ID_PRODUCTO.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.CATEGORIA === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    if (!canEdit) return;
    setEditingProduct(null);
    setProdNombre('');
    setProdCategoria(categorias[0]?.CATEGORIA || 'Carnes y Aves');
    setProdUnidad('Kg');
    setStockMin(10);
    setStockMax(50);
    setCostoRef(15.00);
    setModalOpen(true);
  };

  const handleOpenEdit = (prd: Producto) => {
    if (!canEdit) return;
    setEditingProduct(prd);
    setProdNombre(prd.PRODUCTO);
    setProdCategoria(prd.CATEGORIA);
    setProdUnidad(prd.UNIDAD);
    setStockMin(prd.STOCK_MINIMO);
    setStockMax(prd.STOCK_MAXIMO);
    setCostoRef(prd.COSTO_REFERENCIAL);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const catObj = categorias.find(c => c.CATEGORIA === prodCategoria);

    if (editingProduct) {
      // Update
      const res = Storage.updateProducto({
        ...editingProduct,
        PRODUCTO: prodNombre,
        CATEGORIA: prodCategoria,
        ID_CATEGORIA: catObj?.ID_CATEGORIA || 'CAT-001',
        UNIDAD: prodUnidad,
        STOCK_MINIMO: Number(stockMin),
        STOCK_MAXIMO: Number(stockMax),
        COSTO_REFERENCIAL: Number(costoRef)
      }, currentUser.ROL);

      if (res.success) {
        setFeedback('¡Producto actualizado correctamente!');
        setModalOpen(false);
        onRefreshData();
      }
    } else {
      // Create
      const res = Storage.addProducto({
        PRODUCTO: prodNombre,
        CATEGORIA: prodCategoria,
        ID_CATEGORIA: catObj?.ID_CATEGORIA || 'CAT-001',
        UNIDAD: prodUnidad,
        STOCK_MINIMO: Number(stockMin),
        STOCK_MAXIMO: Number(stockMax),
        COSTO_REFERENCIAL: Number(costoRef),
        ACTIVO: true
      }, currentUser.ROL);

      if (res.success) {
        setFeedback('¡Nuevo producto añadido al catálogo de ÉCLAT!');
        setModalOpen(false);
        onRefreshData();
      }
    }
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!canEdit) return;
    if (confirm('¿Desea desactivar este producto del catálogo?')) {
      Storage.deleteProducto(prodId, currentUser.ROL);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Catálogo General de Productos e Insumos
            </h2>
            <p className="text-xs text-slate-500">
              Catálogo unificado para catering y servicios de limpieza
            </p>
          </div>
        </div>

        {/* Action Button or Read-Only Badge */}
        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Nuevo Producto</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Edición Restringida al Administrador</span>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o ID de producto..."
            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004346]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
          >
            <option value="Todas">Todas las Categorías</option>
            {categorias.map(c => <option key={c.ID_CATEGORIA} value={c.CATEGORIA}>{c.CATEGORIA}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#004346] text-[#D6F3F4] text-[10px] font-black uppercase">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Producto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-center">Unidad</th>
                <th className="py-3 px-3 text-right">Stock Mínimo</th>
                <th className="py-3 px-3 text-right">Stock Máximo</th>
                <th className="py-3 px-3 text-center">Estado</th>
                {canEdit && <th className="py-3 px-3 text-center">Acciones (Admin)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProductos.map((p) => (
                <tr key={p.ID_PRODUCTO} className={`hover:bg-slate-50 ${!p.ACTIVO ? 'opacity-50 bg-slate-100' : ''}`}>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-500">{p.ID_PRODUCTO}</td>
                  <td className="py-2.5 px-3 font-black text-slate-900">{p.PRODUCTO}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">{p.CATEGORIA}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#004346]">{p.UNIDAD}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">{p.STOCK_MINIMO}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p.STOCK_MAXIMO}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.ACTIVO ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {p.ACTIVO ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {canEdit && (
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-[#004346] hover:bg-[#D6F3F4] rounded"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.ID_PRODUCTO)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Desactivar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#004346] w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-black text-base uppercase text-[#004346]">
                {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Nombre del Producto / Insumo</label>
                <input
                  type="text"
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  placeholder="Ej. Carne de Res Lomo, Cloro 5%"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Categoría</label>
                  <select
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    {categorias.map(c => <option key={c.ID_CATEGORIA} value={c.CATEGORIA}>{c.CATEGORIA}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Unidad de Medida</label>
                  <select
                    value={prodUnidad}
                    onChange={(e) => setProdUnidad(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Kg">Kg (Kilogramos)</option>
                    <option value="Lt">Lt (Litros)</option>
                    <option value="Unid">Unid (Unidades)</option>
                    <option value="Cja">Cja (Cajas)</option>
                    <option value="Bolsa">Bolsa</option>
                    <option value="Saco">Saco</option>
                    <option value="Galon">Galón</option>
                    <option value="Lat">Lata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Stock Mín.</label>
                  <input
                    type="number"
                    value={stockMin}
                    onChange={(e) => setStockMin(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Stock Máx.</label>
                  <input
                    type="number"
                    value={stockMax}
                    onChange={(e) => setStockMax(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Costo Ref.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costoRef}
                    onChange={(e) => setCostoRef(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#004346] text-[#D6F3F4] font-black uppercase rounded-xl">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
