/**
 * ERP ÉCLAT - Mobile Navigation Menu Component
 * Main Grid & Tab bar matching AppSheet structure and brand colors (#004346 & #D6F3F4)
 */

import React from 'react';
import { ActiveView, UserRole } from '../types';
import {
  Package,
  ShoppingCart,
  History,
  UtensilsCrossed,
  Users,
  TrendingDown,
  ArrowDownCircle,
  Settings,
  ListFilter
} from 'lucide-react';

interface NavigationProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  userRole: UserRole;
  lowStockCount?: number;
  pendingOrdersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  userRole,
  lowStockCount = 0,
  pendingOrdersCount = 0
}) => {
  const navItems = [
    {
      id: 'INVENTARIOS' as ActiveView,
      label: 'INVENTARIOS',
      subtitle: 'Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'ENTRADAS' as ActiveView,
      label: 'ENTRADAS',
      subtitle: 'Ingresos',
      icon: ArrowDownCircle
    },
    {
      id: 'CONSUMOS' as ActiveView,
      label: 'CONSUMOS',
      subtitle: 'Salidas',
      icon: TrendingDown
    },
    {
      id: 'PRODUCCION' as ActiveView,
      label: 'PRODUCCIÓN',
      subtitle: 'Catering',
      icon: UtensilsCrossed
    },
    {
      id: 'PEDIDOS' as ActiveView,
      label: 'PEDIDOS',
      subtitle: 'Requerimientos',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
      badgeColor: 'bg-sky-500 text-white font-black'
    },
    {
      id: 'KARDEX' as ActiveView,
      label: 'KARDEX',
      subtitle: 'Movimientos',
      icon: History
    },
    {
      id: 'PRODUCTOS' as ActiveView,
      label: 'CATÁLOGO',
      subtitle: 'Insumos',
      icon: ListFilter
    },
    {
      id: 'USUARIOS' as ActiveView,
      label: 'USUARIOS',
      subtitle: 'Personal',
      icon: Users
    },
    {
      id: 'CONFIGURACION' as ActiveView,
      label: 'CONFIGURACIÓN',
      subtitle: 'Servidor',
      icon: Settings
    }
  ];

  return (
    <nav className="p-3 sm:p-4 bg-[#D6F3F4]/30 rounded-2xl border border-[#004346]/10 mb-6 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isRestricted = (item.id === 'CONFIGURACION' || item.id === 'USUARIOS') && userRole !== 'Administrador';

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-xl text-center transition-all duration-200 group active:scale-95 shadow-sm ${
                isActive
                  ? 'bg-[#004346] text-white ring-2 ring-[#004346] ring-offset-2 ring-offset-[#D6F3F4] shadow-md'
                  : 'bg-white text-slate-800 hover:bg-[#D6F3F4]/80 border border-slate-200 hover:border-[#004346]/40'
              }`}
            >
              {/* Badge */}
              {item.badge && (
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}

              <div className={`p-2.5 rounded-full mb-2 transition-transform group-hover:scale-110 ${
                isActive ? 'bg-[#D6F3F4] text-[#004346]' : 'bg-[#D6F3F4]/60 text-[#004346]'
              }`}>
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div>
                <div className={`font-black tracking-tight text-xs sm:text-sm uppercase ${
                  isActive ? 'text-white' : 'text-[#004346]'
                }`}>
                  {item.label}
                </div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isActive ? 'text-[#D6F3F4]' : 'text-slate-500'
                }`}>
                  {item.subtitle}
                </div>
              </div>

              {isRestricted && (
                <span className="mt-1 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
