/**
 * ERP ÉCLAT - Types and Interfaces
 * Servicios Integrales de Limpieza y Catering ÉCLAT
 */

export type UserRole = 'Administrador' | 'Supervisor' | 'Cocinera';

export interface Usuario {
  ID_USUARIO: string;
  NOMBRE: string;
  EMAIL: string;
  PIN: string;
  ROL: UserRole;
  ESTACION_ASIGNADA: string; // "Todas" or specific station ID/Name
  ESTADO: 'Activo' | 'Inactivo';
  ULTIMA_CONEXION?: string;
}

export interface Estacion {
  ID_ESTACION: string;
  ESTACION: string; // e.g. "Tapirani", "Torrepampa"
  UBICACION: string;
  ENCARGADO: string;
  ESTADO: 'Activo' | 'Inactivo';
}

export interface Categoria {
  ID_CATEGORIA: string;
  CATEGORIA: string; // e.g. "Carnes", "Verduras", "Frutas", "Abarrotes", "Lácteos", "Bebidas", "Limpieza", "Condimentos"
  DESCRIPCION: string;
}

export type UnidadMedida = 'Kg' | 'Lt' | 'Unid' | 'Cja' | 'Paq' | 'Bolsa' | 'Lat' | 'Gr' | 'Saco' | 'Galon';

export interface Producto {
  ID_PRODUCTO: string;
  PRODUCTO: string;
  ID_CATEGORIA: string;
  CATEGORIA: string;
  UNIDAD: UnidadMedida;
  STOCK_MINIMO: number;
  STOCK_MAXIMO: number;
  COSTO_REFERENCIAL: number;
  ACTIVO: boolean;
}

export interface Inventario {
  ID_INVENTARIO: string; // Primary Key e.g. "INV-TAP-PRD001"
  ESTACION_ID: string;
  ESTACION: string;
  PRODUCTO_ID: string;
  PRODUCTO: string;
  CATEGORIA: string;
  UNIDAD: UnidadMedida;
  STOCK_ACTUAL: number;
  STOCK_MINIMO: number;
  STOCK_MAXIMO: number;
  ULTIMA_ACTUALIZACION: string; // ISO String
}

export interface Entrada {
  ID_ENTRADA: string;
  FECHA_HORA: string; // ISO String timestamp
  ESTACION_ID: string;
  ESTACION: string;
  PRODUCTO_ID: string;
  PRODUCTO: string;
  UNIDAD: UnidadMedida;
  CANTIDAD: number;
  COSTO_UNITARIO: number;
  COSTO_TOTAL: number;
  PROVEEDOR: string;
  OBSERVACIONES?: string;
  USUARIO: string;
  CREADO_EL: string; // For 24h edit window check
}

export interface Consumo {
  ID_CONSUMO: string;
  FECHA_HORA: string;
  ESTACION_ID: string;
  ESTACION: string;
  PRODUCTO_ID: string;
  PRODUCTO: string;
  UNIDAD: UnidadMedida;
  CANTIDAD: number;
  TIPO_CONSUMO: 'Cocina/Alimentación' | 'Limpieza' | 'Mantenimiento' | 'Merma/Pérdida';
  OBSERVACIONES?: string;
  USUARIO: string;
  CREADO_EL: string; // For 24h edit window check
}

export interface ItemReceta {
  PRODUCTO_ID: string;
  PRODUCTO: string;
  CANTIDAD_POR_PERSONA: number;
  UNIDAD: UnidadMedida;
}

export interface ProduccionDiaria {
  ID_PRODUCCION: string;
  FECHA: string; // YYYY-MM-DD
  HORA_REGISTRO: string;
  ESTACION_ID: string;
  ESTACION: string;
  SERVICIO: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Refrigerio/Snack' | 'Especial';
  CANTIDAD_PERSONAS: number;
  MENU_DESCRIPCION: string;
  CONSUMOS_ASOCIADOS: {
    PRODUCTO_ID: string;
    PRODUCTO: string;
    UNIDAD: UnidadMedida;
    CANTIDAD_UTILIZADA: number;
  }[];
  OBSERVACIONES?: string;
  USUARIO: string;
  CREADO_EL: string; // For 24h edit window check
}

export type EstadoPedido = 'Sugerido' | 'Pendiente' | 'Aprobado' | 'Despachado' | 'Rechazado';

export interface ItemPedido {
  PRODUCTO_ID: string;
  PRODUCTO: string;
  CATEGORIA: string;
  UNIDAD: UnidadMedida;
  STOCK_ACTUAL: number;
  STOCK_MINIMO: number;
  CANTIDAD_SOLICITADA: number;
  OBSERVACION_ITEM?: string;
}

export interface Pedido {
  ID_PEDIDO: string;
  FECHA_PEDIDO: string;
  ESTACION_ID: string;
  ESTACION: string;
  SOLICITANTE: string; // Cocinera / Supervisor
  ESTADO: EstadoPedido;
  ORIGEN: 'Sugerido por Sistema' | 'Manual por Cocinera' | 'Manual por Supervisor';
  ITEMS: ItemPedido[];
  OBSERVACIONES_GENERALES?: string;
  FECHA_APROBACION?: string;
  APROBADO_POR?: string;
  CREADO_EL: string;
}

export type TipoMovimientoKardex = 'ENTRADA' | 'CONSUMO' | 'AJUSTE' | 'PRODUCCION';

export interface KardexEntry {
  ID_KARDEX: string;
  FECHA_HORA: string;
  ESTACION_ID: string;
  ESTACION: string;
  PRODUCTO_ID: string;
  PRODUCTO: string;
  CATEGORIA: string;
  UNIDAD: UnidadMedida;
  TIPO_MOVIMIENTO: TipoMovimientoKardex;
  CANTIDAD_ENTRADA: number;
  CANTIDAD_SALIDA: number;
  SALDO_RESULTANTE: number;
  USUARIO: string;
  REFERENCIA: string; // e.g. "ENT-001" or "CON-005"
  OBSERVACIONES?: string;
}

export interface SyncQueueItem {
  id: string;
  tabla: string; // 'Entradas', 'Consumos', 'ProduccionDiaria', 'Pedidos', etc.
  accion: 'CREATE' | 'UPDATE' | 'DELETE';
  datos: any;
  timestamp: string;
}

export type ActiveView = 
  | 'INVENTARIOS'
  | 'ENTRADAS'
  | 'CONSUMOS'
  | 'PRODUCCION'
  | 'PEDIDOS'
  | 'KARDEX'
  | 'PRODUCTOS'
  | 'USUARIOS'
  | 'CONFIGURACION';
