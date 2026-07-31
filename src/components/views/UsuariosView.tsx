/**
 * ERP ÉCLAT - User Management View (Admin Only)
 * Add and manage staff accounts, station assignments, PIN access codes, and user roles.
 */

import React, { useState } from 'react';
import { Usuario, UserRole } from '../../types';
import { Storage } from '../../lib/storage';
import { Users, Plus, Shield, KeyRound, Lock, CheckCircle, AlertOctagon, UserCheck, MapPin } from 'lucide-react';

interface UsuariosViewProps {
  currentUser: Usuario;
  onRefreshData: () => void;
  onOpenChangePinModal?: () => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  currentUser,
  onRefreshData,
  onOpenChangePinModal
}) => {
  const usuarios = Storage.getUsuarios();
  const estaciones = Storage.getEstaciones();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // User form state
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pin, setPin] = useState<string>('1234');
  const [rol, setRol] = useState<UserRole>('Cocinera');
  const [estacionAsignada, setEstacionAsignada] = useState<string>(estaciones[0]?.ID_ESTACION || 'EST-001');

  // New Campamento modal state
  const [showAddCampamentoModal, setShowAddCampamentoModal] = useState<boolean>(false);
  const [campNombre, setCampNombre] = useState<string>('');
  const [campUbicacion, setCampUbicacion] = useState<string>('');
  const [campEncargado, setCampEncargado] = useState<string>('');

  const [feedback, setFeedback] = useState<string>('');

  const canManage = currentUser.ROL === 'Administrador';

  // Access Denied Screen if non-admin
  if (!canManage) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-lg mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase">Acceso Restringido - Exclusivo Administrador</h2>
        <p className="text-xs text-slate-600">
          Usted está autenticado como <strong className="text-[#004346]">{currentUser.ROL}</strong>. La gestión de usuarios y asignación de personal a estaciones requiere permisos de nivel Administrador Central.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNombre('');
    setEmail('');
    setPin('1234');
    setRol('Cocinera');
    setEstacionAsignada(estaciones[0]?.ID_ESTACION || 'EST-001');
    setShowAddModal(true);
  };

  const handleOpenEdit = (usr: Usuario) => {
    setEditingUser(usr);
    setNombre(usr.NOMBRE);
    setEmail(usr.EMAIL);
    setPin(usr.PIN);
    setRol(usr.ROL);
    setEstacionAsignada(usr.ESTACION_ASIGNADA);
    setShowAddModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const res = Storage.updateUsuario({
        ...editingUser,
        NOMBRE: nombre,
        EMAIL: email,
        PIN: pin,
        ROL: rol,
        ESTACION_ASIGNADA: estacionAsignada
      }, currentUser.ROL);

      if (res.success) {
        setFeedback('¡Datos del usuario actualizados correctamente!');
        setShowAddModal(false);
        onRefreshData();
      }
    } else {
      const res = Storage.addUsuario({
        NOMBRE: nombre,
        EMAIL: email,
        PIN: pin,
        ROL: rol,
        ESTACION_ASIGNADA: estacionAsignada,
        ESTADO: 'Activo'
      }, currentUser.ROL);

      if (res.success) {
        setFeedback('¡Nuevo personal registrado exitosamente en el sistema ÉCLAT!');
        setShowAddModal(false);
        onRefreshData();
      }
    }
  };

  const handleSaveCampamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campNombre.trim()) return;

    const res = Storage.addEstacion({
      ESTACION: campNombre.trim(),
      UBICACION: campUbicacion.trim() || 'Sector Operativo',
      ENCARGADO: campEncargado.trim() || 'Sin Asignar',
      ESTADO: 'Activo'
    }, currentUser.ROL);

    if (res.success) {
      setFeedback(`¡Nuevo campamento "${campNombre}" registrado correctamente! Ya se encuentra disponible para asignaciones de personal e inventarios.`);
      setCampNombre('');
      setCampUbicacion('');
      setCampEncargado('');
      setShowAddCampamentoModal(false);
      onRefreshData();
    } else {
      alert(res.error || 'Error al crear el campamento.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004346] text-[#D6F3F4] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#004346] uppercase tracking-tight">
              Gestión de Personal y Control de Accesos
            </h2>
            <p className="text-xs text-slate-500">
              Módulo de administración de cocineras, supervisores, estaciones y PINs
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenChangePinModal && (
            <button
              onClick={onOpenChangePinModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Cambiar mi PIN</span>
            </button>
          )}

          <button
            onClick={() => setShowAddCampamentoModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            <span>Crear Nuevo Campamento</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Personal</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {usuarios.map((u) => {
          const estacionObj = estaciones.find(e => e.ID_ESTACION === u.ESTACION_ASIGNADA);
          const stationLabel = u.ESTACION_ASIGNADA === 'Todas' ? 'Todas las Estaciones' : (estacionObj?.ESTACION || u.ESTACION_ASIGNADA);

          return (
            <div key={u.ID_USUARIO} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    u.ROL === 'Administrador' ? 'bg-amber-100 text-amber-900' :
                    u.ROL === 'Supervisor' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-xs">{u.NOMBRE}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.EMAIL}</div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  u.ROL === 'Administrador' ? 'bg-amber-100 text-amber-900' :
                  u.ROL === 'Supervisor' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {u.ROL}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>Estación: <strong className="text-[#004346]">{stationLabel}</strong></div>
                <div className="flex items-center justify-between">
                  <span>Código PIN: <strong className="font-mono text-slate-900">{u.PIN}</strong></span>
                  <span className="text-[10px] text-slate-400">Estado: {u.ESTADO}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(u)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Editar Perfil o Cambiar PIN
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#004346] w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-black text-base uppercase text-[#004346]">
                {editingUser ? 'Editar Perfil de Personal' : 'Registrar Nuevo Personal'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Maria Gonzalez"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@eclat.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Rol de Usuario</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Cocinera">Cocinera</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Código PIN (4 dígitos)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Estación / Campamento Asignado</label>
                <select
                  value={estacionAsignada}
                  onChange={(e) => setEstacionAsignada(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Todas">Todas las Estaciones</option>
                  {estaciones.map(e => <option key={e.ID_ESTACION} value={e.ID_ESTACION}>{e.ESTACION}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#004346] text-[#D6F3F4] font-black uppercase rounded-xl">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Campamento Modal */}
      {showAddCampamentoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#004346] w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#004346]" />
                <h3 className="font-black text-base uppercase text-[#004346]">
                  Crear Nuevo Campamento / Estación
                </h3>
              </div>
              <button onClick={() => setShowAddCampamentoModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCampamento} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Nombre del Campamento</label>
                <input
                  type="text"
                  value={campNombre}
                  onChange={(e) => setCampNombre(e.target.value)}
                  placeholder="Ej. Campamento Yanaquihua Sur"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Ubicación / Sector Operativo</label>
                <input
                  type="text"
                  value={campUbicacion}
                  onChange={(e) => setCampUbicacion(e.target.value)}
                  placeholder="Ej. Sector Minero N° 2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">Encargado / Responsable Inicial</label>
                <input
                  type="text"
                  value={campEncargado}
                  onChange={(e) => setCampEncargado(e.target.value)}
                  placeholder="Ej. Chef / Cocinera Jefa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                💡 Al crear el campamento se inicializará automáticamente su stock de inventario independiente para todos los insumos del catálogo.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddCampamentoModal(false)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#004346] text-[#D6F3F4] font-black uppercase rounded-xl">+ Crear Campamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
