/**
 * ERP ÉCLAT - Change PIN Modal
 * Allows active user to update their access PIN code securely
 */

import React, { useState } from 'react';
import { Usuario } from '../types';
import { Storage } from '../lib/storage';
import { KeyRound, Lock, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface ChangePinModalProps {
  currentUser: Usuario;
  onClose: () => void;
  onPinChanged: (updatedUser: Usuario) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  currentUser,
  onClose,
  onPinChanged,
}) => {
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Verification 1: Current PIN match
    if (currentPin.trim() !== currentUser.PIN) {
      setErrorMsg('El PIN actual ingresado no es correcto.');
      return;
    }

    // Verification 2: New PIN minimum length
    if (newPin.trim().length < 4) {
      setErrorMsg('El nuevo PIN debe tener al menos 4 dígitos o caracteres.');
      return;
    }

    // Verification 3: Confirm PIN match
    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg('El nuevo PIN y su confirmación no coinciden.');
      return;
    }

    // Perform Update
    const res = Storage.updateUserPin(currentUser.ID_USUARIO, newPin.trim());

    if (res.success) {
      const updatedUser: Usuario = {
        ...currentUser,
        PIN: newPin.trim(),
      };
      setSuccessMsg('¡PIN actualizado exitosamente!');
      onPinChanged(updatedUser);

      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Error al actualizar el PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#004346] w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2 text-[#004346]">
            <div className="p-2 bg-[#D6F3F4] rounded-xl text-[#004346]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase">Cambiar PIN de Acceso</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Usuario: <span className="font-bold text-slate-800">{currentUser.NOMBRE}</span> ({currentUser.ROL})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              PIN Actual
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Ingrese su PIN actual"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004346] focus:bg-white"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nuevo PIN (Mínimo 4 dígitos)
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Ej. 5555"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004346] focus:bg-white"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Confirmar Nuevo PIN
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Repita su nuevo PIN"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004346] focus:bg-white"
                required
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
            💡 Guarde bien su nuevo PIN. Le servirá para ingresar en su próximo inicio de sesión en el sistema ERP ÉCLAT.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004346] hover:bg-[#003133] text-[#D6F3F4] font-black uppercase rounded-xl shadow-md active:scale-95 transition-all"
            >
              Guardar Nuevo PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
