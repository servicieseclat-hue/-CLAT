/**
 * ERP ÉCLAT - Principal Application Entry
 * Servicios Integrales de Limpieza y Catering ÉCLAT
 * Mobile-First Offline ERP Engine
 */

import React, { useState, useEffect } from 'react';
import { Usuario, ActiveView } from './types';
import { Storage } from './lib/storage';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LoginModal } from './components/LoginModal';
import { ChangePinModal } from './components/ChangePinModal';
import { Lock } from 'lucide-react';

// Views
import { InventariosView } from './components/views/InventariosView';
import { EntradasView } from './components/views/EntradasView';
import { ConsumosView } from './components/views/ConsumosView';
import { ProduccionDiariaView } from './components/views/ProduccionDiariaView';
import { PedidosView } from './components/views/PedidosView';
import { KardexView } from './components/views/KardexView';
import { ProductosCatalogView } from './components/views/ProductosCatalogView';
import { UsuariosView } from './components/views/UsuariosView';
import { ConfiguracionView } from './components/views/ConfiguracionView';

export default function App() {
  const usuarios = Storage.getUsuarios();

  // Active authenticated user (Default to Cook Tapirani or first user)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('ECLAT_ERP_ACTIVE_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return usuarios[2] || usuarios[0]; }
    }
    return usuarios[2] || usuarios[0]; // Default Cocinera Maria Tapirani
  });

  const [currentStation, setCurrentStation] = useState<string>(() => {
    if (currentUser?.ESTACION_ASIGNADA && currentUser.ESTACION_ASIGNADA !== 'Todas') {
      return currentUser.ESTACION_ASIGNADA;
    }
    return 'Todas';
  });

  const [activeView, setActiveView] = useState<ActiveView>('INVENTARIOS');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(!currentUser);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ECLAT_ERP_ACTIVE_USER', JSON.stringify(currentUser));
      if (currentUser.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas') {
        setCurrentStation(currentUser.ESTACION_ASIGNADA);
      }
    } else {
      localStorage.removeItem('ECLAT_ERP_ACTIVE_USER');
    }
  }, [currentUser]);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePinChanged = (updatedUser: Usuario) => {
    setCurrentUser(updatedUser);
    handleRefreshData();
  };

  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    if (user.ESTACION_ASIGNADA !== 'Todas') {
      setCurrentStation(user.ESTACION_ASIGNADA);
    } else {
      setCurrentStation('Todas');
    }
    setShowLoginModal(false);
    handleRefreshData();
  };

  const handleStationChange = (stationId: string) => {
    if (currentUser?.ROL === 'Cocinera' && currentUser.ESTACION_ASIGNADA !== 'Todas') {
      setCurrentStation(currentUser.ESTACION_ASIGNADA);
    } else {
      setCurrentStation(stationId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  // Dynamic counts for navigation badges
  const lowStockCount = Storage.getInventarios(currentStation).filter(i => i.STOCK_ACTUAL < i.STOCK_MINIMO).length;
  const pendingOrdersCount = Storage.getPedidos(currentStation).filter(p => p.ESTADO === 'Pendiente').length;

  return (
    <div className="min-h-screen bg-[#D6F3F4]/20 text-slate-800 font-sans flex flex-col antialiased">
      {/* Login Screen Overlay */}
      {showLoginModal || !currentUser ? (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Main ERP Header */}
          <Header
            currentUser={currentUser}
            currentStation={currentStation}
            onStationChange={handleStationChange}
            onLogout={handleLogout}
            onOpenSyncModal={() => setActiveView('CONFIGURACION')}
            onOpenChangePinModal={() => setShowChangePinModal(true)}
          />

          {/* Body Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
            {/* Navigation Grid */}
            <Navigation
              activeView={activeView}
              onSelectView={setActiveView}
              userRole={currentUser.ROL}
              lowStockCount={lowStockCount}
              pendingOrdersCount={pendingOrdersCount}
            />

            {/* View Switcher */}
            <div key={refreshKey} className="pb-12">
              {activeView === 'INVENTARIOS' && (
                <InventariosView
                  currentUser={currentUser}
                  currentStation={currentStation}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'ENTRADAS' && (
                <EntradasView
                  currentUser={currentUser}
                  currentStation={currentStation}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'CONSUMOS' && (
                <ConsumosView
                  currentUser={currentUser}
                  currentStation={currentStation}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'PRODUCCION' && (
                <ProduccionDiariaView
                  currentUser={currentUser}
                  currentStation={currentStation}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'PEDIDOS' && (
                <PedidosView
                  currentUser={currentUser}
                  currentStation={currentStation}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'KARDEX' && (
                <KardexView
                  currentUser={currentUser}
                  currentStation={currentStation}
                />
              )}

              {activeView === 'PRODUCTOS' && (
                <ProductosCatalogView
                  currentUser={currentUser}
                  onRefreshData={handleRefreshData}
                />
              )}

              {activeView === 'USUARIOS' && (
                <UsuariosView
                  currentUser={currentUser}
                  onRefreshData={handleRefreshData}
                  onOpenChangePinModal={() => setShowChangePinModal(true)}
                />
              )}

              {activeView === 'CONFIGURACION' && (
                currentUser.ROL === 'Administrador' ? (
                  <ConfiguracionView
                    currentUser={currentUser}
                    onRefreshData={handleRefreshData}
                    onOpenChangePinModal={() => setShowChangePinModal(true)}
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center border-2 border-amber-300 shadow-sm max-w-lg mx-auto space-y-4 my-8">
                    <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase">Acceso Restringido</h3>
                    <p className="text-xs text-slate-600 font-medium">
                      La sección de <strong>Configuración y Sincronización</strong> está reservada exclusivamente para los usuarios con rol de <strong>Administrador</strong>.
                    </p>
                    <button
                      onClick={() => setActiveView('INVENTARIOS')}
                      className="px-4 py-2 bg-[#004346] text-[#D6F3F4] text-xs font-bold rounded-xl uppercase hover:bg-[#003133]"
                    >
                      Volver a Inventarios
                    </button>
                  </div>
                )
              )}
            </div>
          </main>

          {/* Change PIN Modal Overlay */}
          {showChangePinModal && currentUser && (
            <ChangePinModal
              currentUser={currentUser}
              onClose={() => setShowChangePinModal(false)}
              onPinChanged={handlePinChanged}
            />
          )}

          {/* Sticky Mobile Quick Navigation Bar */}
          <footer className="bg-[#004346] text-white py-3 border-t-2 border-[#81c3d7] text-center text-xs text-[#D6F3F4] font-medium">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
              <div>
                <strong>Servicios Integrales de Limpieza y Catering ÉCLAT S.A.C.</strong>
              </div>
              <div className="text-[11px] text-slate-300">
                Sistema ERP Móvil Campamentos • Estación Activa: <span className="font-bold text-[#D6F3F4]">{currentStation}</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
