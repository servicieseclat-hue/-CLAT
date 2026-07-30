/**
 * ERP ÉCLAT - Login / Authentication Screen
 * Rol-based authentication with PIN / Password for Administrador, Supervisor, Cocinera
 */

import React, { useState } from 'react';
import { Usuario } from '../types';
import { LogoEclat } from './LogoEclat';
import { Storage } from '../lib/storage';
import { Shield, KeyRound, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const usuarios = Storage.getUsuarios();
  const [selectedUserId, setSelectedUserId] = useState<string>(usuarios[2]?.ID_USUARIO || usuarios[0]?.ID_USUARIO);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activeUser = usuarios.find(u => u.ID_USUARIO === selectedUserId) || usuarios[0];

  const handleQuickLogin = (usr: Usuario) => {
    setSelectedUserId(usr.ID_USUARIO);
    setPinInput(usr.PIN);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    if (pinInput.trim() === activeUser.PIN) {
      activeUser.ULTIMA_CONEXION = new Date().toISOString();
      Storage.updateUsuario(activeUser, 'Administrador'); // internal update
      onLoginSuccess(activeUser);
    } else {
      setErrorMessage('Código PIN incorrecto. Intente nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#004346]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#81c3d7] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header / Brand */}
        <div className="bg-[#004346] p-6 text-center text-white relative">
          <div className="flex justify-center mb-3">
            <LogoEclat variant="full" size="lg" darkBg={true} />
          </div>
          <p className="text-[#D6F3F4] text-xs font-semibold tracking-wide uppercase mt-1">
            Sistema ERP de Control Operativo
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Catering e Inventarios para Campamentos y Estaciones
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Select User Card List */}
          <div>
            <label className="block text-xs font-bold text-[#004346] uppercase mb-2">
              Seleccione su Perfil de Usuario
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {usuarios.filter(u => u.ESTADO === 'Activo').map(u => {
                const isSelected = u.ID_USUARIO === selectedUserId;
                return (
                  <button
                    key={u.ID_USUARIO}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#D6F3F4] border-[#004346] ring-2 ring-[#004346]/20 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        u.ROL === 'Administrador' ? 'bg-amber-100 text-amber-800' :
                        u.ROL === 'Supervisor' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{u.NOMBRE}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Rol: <span className="font-bold text-[#004346]">{u.ROL}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#004346] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-xs font-bold text-[#004346] uppercase mb-1.5">
              Ingrese Código PIN (PIN Demo Autocompletado)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5 text-[#004346]" />
              </div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ej. 1111 o 1234"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg tracking-widest font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004346] focus:bg-white"
                required
              />
            </div>
            {errorMessage && (
              <div className="flex items-center gap-1.5 text-rose-600 text-xs mt-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Demo hint badges */}
          <div className="bg-[#D6F3F4]/50 border border-[#004346]/20 p-2.5 rounded-xl text-[11px] text-[#004346] space-y-1">
            <div className="font-bold">🔑 PINs predeterminados de acceso rápido:</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div>• <strong>1234</strong>: Admin (Total)</div>
              <div>• <strong>2222</strong>: Supervisor</div>
              <div>• <strong>1111</strong>: Cocinera Tapirani</div>
              <div>• <strong>3333</strong>: Cocinera Torrepampa</div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-[#004346] text-[#D6F3F4] font-black uppercase tracking-wider rounded-xl hover:bg-[#003133] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#81c3d7]" />
            <span>INICIO SESIÓN</span>
          </button>
        </form>

        <div className="bg-slate-100 px-6 py-3 text-center text-[10px] text-slate-500 border-t border-slate-200">
          Operatividad Offline Garantizada • ÉCLAT S.A.C. © 2026
        </div>
      </div>
    </div>
  );
};
