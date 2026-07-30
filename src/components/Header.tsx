/**
 * ERP ÉCLAT - Header Bar Component
 * Brand Colors: #004346 and #D6F3F4
 */

import React, { useState, useEffect } from 'react';
import { LogoEclat } from './LogoEclat';
import { Usuario, Estacion } from '../types';
import { Wifi, WifiOff, RefreshCw, LogOut, UserCheck, MapPin, ShieldAlert } from 'lucide-react';
import { Storage } from '../lib/storage';

interface HeaderProps {
  currentUser: Usuario;
  currentStation: string;
  onStationChange: (stationId: string) => void;
  onLogout: () => void;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentStation,
  onStationChange,
  onLogout,
  onOpenSyncModal
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const estaciones = Storage.getEstaciones();

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const interval = setInterval(() => {
      setPendingSyncCount(Storage.getSyncQueue().length);
    }, 2000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Supervisor': return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'Cocinera': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isCookLocked = currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas';
  const availableEstaciones = isCookLocked
    ? estaciones.filter(e => e.ID_ESTACION === currentUser.ESTACION_ASIGNADA)
    : estaciones;

  return (
    <header className="bg-[#004346] text-white shadow-md border-b-4 border-[#81c3d7] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LogoEclat variant="full" size="sm" darkBg={true} />
        </div>

        {/* Station Selector & Sync Status & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Station Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#003133] border border-[#005c60] rounded-lg px-2.5 py-1 text-xs text-[#D6F3F4]">
            <MapPin className="w-3.5 h-3.5 text-[#D6F3F4] shrink-0" />
            {isCookLocked ? (
              <span className="font-bold text-white px-1">
                {availableEstaciones[0]?.ESTACION || 'Estación Asignada'} (Exclusiva)
              </span>
            ) : (
              <select
                value={currentStation}
                onChange={(e) => onStationChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {currentUser.ROL === 'Administrador' || currentUser.ROL === 'Supervisor' || currentUser.ESTACION_ASIGNADA === 'Todas' ? (
                  <option value="Todas" className="bg-[#004346] text-white">Todas las Estaciones</option>
                ) : null}
                {availableEstaciones.map(est => (
                  <option key={est.ID_ESTACION} value={est.ID_ESTACION} className="bg-[#004346] text-white">
                    {est.ESTACION}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Connection & Sync Status Indicator */}
          <button
            onClick={onOpenSyncModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900'
                : 'bg-amber-950/80 text-amber-300 border-amber-600/50 hover:bg-amber-900 animate-pulse'
            }`}
            title="Estado de conexión y sincronización de datos"
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline">
              {isOnline ? 'Online' : 'Modo Offline'}
            </span>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingSyncCount}
              </span>
            )}
          </button>

          {/* Active User Pill */}
          <div className="flex items-center gap-2 bg-[#003133] border border-[#005c60] px-2.5 py-1 rounded-lg">
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">
                {currentUser.NOMBRE.split(' ')[0]}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(currentUser.ROL)}`}>
                {currentUser.ROL}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-[#005c60] rounded-md transition-colors"
              title="Cerrar sesión / Cambiar Usuario"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Station Switcher Bar */}
      <div className="sm:hidden bg-[#003133] px-3 py-1.5 border-t border-[#005c60] flex items-center justify-between text-xs text-[#D6F3F4]">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#D6F3F4]" />
          <span className="font-medium">Estación:</span>
        </div>
        {isCookLocked ? (
          <span className="font-bold text-white px-2 py-0.5 bg-[#004346] rounded border border-[#81c3d7]">
            {availableEstaciones[0]?.ESTACION || 'Estación Asignada'}
          </span>
        ) : (
          <select
            value={currentStation}
            onChange={(e) => onStationChange(e.target.value)}
            className="bg-[#004346] text-white font-semibold text-xs rounded px-2 py-0.5 border border-[#81c3d7]"
          >
            {currentUser.ROL === 'Administrador' || currentUser.ROL === 'Supervisor' || currentUser.ESTACION_ASIGNADA === 'Todas' ? (
              <option value="Todas">Todas las Estaciones</option>
            ) : null}
            {availableEstaciones.map(est => (
              <option key={est.ID_ESTACION} value={est.ID_ESTACION}>
                {est.ESTACION}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
};
