/**
 * ERP ÉCLAT - Seed / Default Data
 * Servicios Integrales de Limpieza y Catering ÉCLAT
 */

import {
  Estacion,
  Categoria,
  Producto,
  Usuario,
  Inventario,
  KardexEntry,
  Entrada,
  Consumo,
  ProduccionDiaria,
  Pedido
} from '../types';

export const INITIAL_ESTACIONES: Estacion[] = [
  {
    ID_ESTACION: 'EST-001',
    ESTACION: 'Tapirani',
    UBICACION: 'Campamento Minero / Operaciones Tapirani',
    ENCARGADO: 'Maria Gonzalez (Cocinera)',
    ESTADO: 'Activo'
  },
  {
    ID_ESTACION: 'EST-002',
    ESTACION: 'Torrepampa',
    UBICACION: 'Estación Torrepampa Sector Sur',
    ENCARGADO: 'Ana Fernandez (Cocinera)',
    ESTADO: 'Activo'
  },
  {
    ID_ESTACION: 'EST-003',
    ESTACION: 'Campamento Central',
    UBICACION: 'Almacén Base Central',
    ENCARGADO: 'Carlos Mendoza (Supervisor)',
    ESTADO: 'Activo'
  }
];

export const INITIAL_CATEGORIAS: Categoria[] = [
  { ID_CATEGORIA: 'CAT-001', CATEGORIA: 'Carnes y Aves', DESCRIPCION: 'Cortes de res, pollo, cerdo, pescado fresco y congelado' },
  { ID_CATEGORIA: 'CAT-002', CATEGORIA: 'Verduras y Hortalizas', DESCRIPCION: 'Papas, cebollas, tomates, verduras frescas de estación' },
  { ID_CATEGORIA: 'CAT-003', CATEGORIA: 'Frutas', DESCRIPCION: 'Frutas frescas para postre, jugos y desayunos' },
  { ID_CATEGORIA: 'CAT-004', CATEGORIA: 'Abarrotes y Granos', DESCRIPCION: 'Arroz, fideos, menestras, harinas, aceites y azúcares' },
  { ID_CATEGORIA: 'CAT-005', CATEGORIA: 'Lácteos y Huevos', DESCRIPCION: 'Leche, queso, mantequilla, yogur y huevos de gallina' },
  { ID_CATEGORIA: 'CAT-006', CATEGORIA: 'Bebidas e Infusiones', DESCRIPCION: 'Café, té, manzanilla, jugos embotellados y agua' },
  { ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', DESCRIPCION: 'Detergentes, desinfectantes, lavavajillas, lechía y desengrasantes' },
  { ID_CATEGORIA: 'CAT-008', CATEGORIA: 'Condimentos y Especias', DESCRIPCION: 'Sal, pimienta, orégano, comino, sillao y aderezos' },
  { ID_CATEGORIA: 'CAT-009', CATEGORIA: 'Insumos y Descartables', DESCRIPCION: 'Servilletas, bolsas, film plástico, envases térmicos' }
];

export const INITIAL_PRODUCTOS: Producto[] = [
  // Carnes
  { ID_PRODUCTO: 'PRD-001', PRODUCTO: 'Carne de Res Lomo', ID_CATEGORIA: 'CAT-001', CATEGORIA: 'Carnes y Aves', UNIDAD: 'Kg', STOCK_MINIMO: 15, STOCK_MAXIMO: 60, COSTO_REFERENCIAL: 32.50, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-002', PRODUCTO: 'Pollo Entero Limpio', ID_CATEGORIA: 'CAT-001', CATEGORIA: 'Carnes y Aves', UNIDAD: 'Kg', STOCK_MINIMO: 20, STOCK_MAXIMO: 80, COSTO_REFERENCIAL: 11.80, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-003', PRODUCTO: 'Filete de Chuleta de Cerdo', ID_CATEGORIA: 'CAT-001', CATEGORIA: 'Carnes y Aves', UNIDAD: 'Kg', STOCK_MINIMO: 10, STOCK_MAXIMO: 40, COSTO_REFERENCIAL: 22.00, ACTIVO: true },

  // Verduras
  { ID_PRODUCTO: 'PRD-004', PRODUCTO: 'Papa Blanca Canchán', ID_CATEGORIA: 'CAT-002', CATEGORIA: 'Verduras y Hortalizas', UNIDAD: 'Saco', STOCK_MINIMO: 2, STOCK_MAXIMO: 10, COSTO_REFERENCIAL: 85.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-005', PRODUCTO: 'Cebolla Roja', ID_CATEGORIA: 'CAT-002', CATEGORIA: 'Verduras y Hortalizas', UNIDAD: 'Kg', STOCK_MINIMO: 10, STOCK_MAXIMO: 50, COSTO_REFERENCIAL: 3.50, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-006', PRODUCTO: 'Tomate Italiano', ID_CATEGORIA: 'CAT-002', CATEGORIA: 'Verduras y Hortalizas', UNIDAD: 'Kg', STOCK_MINIMO: 8, STOCK_MAXIMO: 35, COSTO_REFERENCIAL: 4.20, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-007', PRODUCTO: 'Zanahoria', ID_CATEGORIA: 'CAT-002', CATEGORIA: 'Verduras y Hortalizas', UNIDAD: 'Kg', STOCK_MINIMO: 6, STOCK_MAXIMO: 25, COSTO_REFERENCIAL: 2.80, ACTIVO: true },

  // Frutas
  { ID_PRODUCTO: 'PRD-008', PRODUCTO: 'Manzana Delicia', ID_CATEGORIA: 'CAT-003', CATEGORIA: 'Frutas', UNIDAD: 'Kg', STOCK_MINIMO: 10, STOCK_MAXIMO: 40, COSTO_REFERENCIAL: 5.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-009', PRODUCTO: 'Plátano de Seda', ID_CATEGORIA: 'CAT-003', CATEGORIA: 'Frutas', UNIDAD: 'Kg', STOCK_MINIMO: 12, STOCK_MAXIMO: 45, COSTO_REFERENCIAL: 3.80, ACTIVO: true },

  // Abarrotes
  { ID_PRODUCTO: 'PRD-010', PRODUCTO: 'Arroz Extra Superior', ID_CATEGORIA: 'CAT-004', CATEGORIA: 'Abarrotes y Granos', UNIDAD: 'Saco', STOCK_MINIMO: 3, STOCK_MAXIMO: 12, COSTO_REFERENCIAL: 165.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-011', PRODUCTO: 'Aceite Vegetal Coche', ID_CATEGORIA: 'CAT-004', CATEGORIA: 'Abarrotes y Granos', UNIDAD: 'Galon', STOCK_MINIMO: 4, STOCK_MAXIMO: 15, COSTO_REFERENCIAL: 38.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-012', PRODUCTO: 'Fideo Tallarín Grueso', ID_CATEGORIA: 'CAT-004', CATEGORIA: 'Abarrotes y Granos', UNIDAD: 'Cja', STOCK_MINIMO: 2, STOCK_MAXIMO: 8, COSTO_REFERENCIAL: 48.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-013', PRODUCTO: 'Azúcar Rubia', ID_CATEGORIA: 'CAT-004', CATEGORIA: 'Abarrotes y Granos', UNIDAD: 'Saco', STOCK_MINIMO: 1, STOCK_MAXIMO: 5, COSTO_REFERENCIAL: 140.00, ACTIVO: true },

  // Lácteos
  { ID_PRODUCTO: 'PRD-014', PRODUCTO: 'Leche Evaporada 400g', ID_CATEGORIA: 'CAT-005', CATEGORIA: 'Lácteos y Huevos', UNIDAD: 'Cja', STOCK_MINIMO: 2, STOCK_MAXIMO: 8, COSTO_REFERENCIAL: 88.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-015', PRODUCTO: 'Huevo Fresco de Gallina', ID_CATEGORIA: 'CAT-005', CATEGORIA: 'Lácteos y Huevos', UNIDAD: 'Cja', STOCK_MINIMO: 2, STOCK_MAXIMO: 10, COSTO_REFERENCIAL: 120.00, ACTIVO: true },

  // Limpieza
  { ID_PRODUCTO: 'PRD-016', PRODUCTO: 'Detergente Industrial Multiuso', ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', UNIDAD: 'Bolsa', STOCK_MINIMO: 5, STOCK_MAXIMO: 20, COSTO_REFERENCIAL: 42.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-017', PRODUCTO: 'Cloro / Lejía Concentrada 5% ', ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', UNIDAD: 'Galon', STOCK_MINIMO: 6, STOCK_MAXIMO: 25, COSTO_REFERENCIAL: 18.50, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-018', PRODUCTO: 'Lavavajillas Líquido Concentrado', ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', UNIDAD: 'Galon', STOCK_MINIMO: 3, STOCK_MAXIMO: 12, COSTO_REFERENCIAL: 28.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-019', PRODUCTO: 'Papel Higiénico Institucional JUMBO', ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', UNIDAD: 'Cja', STOCK_MINIMO: 4, STOCK_MAXIMO: 15, COSTO_REFERENCIAL: 65.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-020', PRODUCTO: 'Desengrasante Industrial de Cocina', ID_CATEGORIA: 'CAT-007', CATEGORIA: 'Limpieza y Desinfección', UNIDAD: 'Galon', STOCK_MINIMO: 2, STOCK_MAXIMO: 8, COSTO_REFERENCIAL: 45.00, ACTIVO: true },

  // Condimentos
  { ID_PRODUCTO: 'PRD-021', PRODUCTO: 'Sal Yodada Industrial', ID_CATEGORIA: 'CAT-008', CATEGORIA: 'Condimentos y Especias', UNIDAD: 'Bolsa', STOCK_MINIMO: 3, STOCK_MAXIMO: 15, COSTO_REFERENCIAL: 15.00, ACTIVO: true },
  { ID_PRODUCTO: 'PRD-022', PRODUCTO: 'Ajo Molido / Entero', ID_CATEGORIA: 'CAT-008', CATEGORIA: 'Condimentos y Especias', UNIDAD: 'Kg', STOCK_MINIMO: 3, STOCK_MAXIMO: 12, COSTO_REFERENCIAL: 14.00, ACTIVO: true }
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    ID_USUARIO: 'USR-001',
    NOMBRE: 'Gerencia ÉCLAT (Admin)',
    EMAIL: 'admin@eclat.com',
    PIN: '1234',
    ROL: 'Administrador',
    ESTACION_ASIGNADA: 'Todas',
    ESTADO: 'Activo',
    ULTIMA_CONEXION: new Date().toISOString()
  },
  {
    ID_USUARIO: 'USR-002',
    NOMBRE: 'Carlos Mendoza (Supervisor)',
    EMAIL: 'supervisor@eclat.com',
    PIN: '2222',
    ROL: 'Supervisor',
    ESTACION_ASIGNADA: 'Todas',
    ESTADO: 'Activo',
    ULTIMA_CONEXION: new Date().toISOString()
  },
  {
    ID_USUARIO: 'USR-003',
    NOMBRE: 'Maria Gonzalez (Cocinera Tapirani)',
    EMAIL: 'maria.tapirani@eclat.com',
    PIN: '1111',
    ROL: 'Cocinera',
    ESTACION_ASIGNADA: 'EST-001', // Tapirani
    ESTADO: 'Activo',
    ULTIMA_CONEXION: new Date().toISOString()
  },
  {
    ID_USUARIO: 'USR-004',
    NOMBRE: 'Ana Fernandez (Cocinera Torrepampa)',
    EMAIL: 'ana.torrepampa@eclat.com',
    PIN: '3333',
    ROL: 'Cocinera',
    ESTACION_ASIGNADA: 'EST-002', // Torrepampa
    ESTADO: 'Activo',
    ULTIMA_CONEXION: new Date().toISOString()
  }
];

// Helper to construct initial inventories per station
export function generateInitialInventarios(
  estaciones: Estacion[],
  productos: Producto[]
): Inventario[] {
  const list: Inventario[] = [];
  const now = new Date().toISOString();

  estaciones.forEach(est => {
    productos.forEach((prd, idx) => {
      // Simulate varied realistic inventory amounts per station
      let stock = 0;
      if (est.ESTACION === 'Tapirani') {
        stock = idx % 3 === 0 ? prd.STOCK_MINIMO - 2 : Math.round(prd.STOCK_MINIMO * 1.8);
      } else if (est.ESTACION === 'Torrepampa') {
        stock = idx % 4 === 0 ? prd.STOCK_MINIMO - 1 : Math.round(prd.STOCK_MINIMO * 2.1);
      } else {
        stock = Math.round(prd.STOCK_MAXIMO * 0.7);
      }

      list.push({
        ID_INVENTARIO: `INV-${est.ID_ESTACION}-${prd.ID_PRODUCTO}`,
        ESTACION_ID: est.ID_ESTACION,
        ESTACION: est.ESTACION,
        PRODUCTO_ID: prd.ID_PRODUCTO,
        PRODUCTO: prd.PRODUCTO,
        CATEGORIA: prd.CATEGORIA,
        UNIDAD: prd.UNIDAD,
        STOCK_ACTUAL: stock,
        STOCK_MINIMO: prd.STOCK_MINIMO,
        STOCK_MAXIMO: prd.STOCK_MAXIMO,
        ULTIMA_ACTUALIZACION: now
      });
    });
  });

  return list;
}

export function generateInitialKardex(inventarios: Inventario[]): KardexEntry[] {
  const now = new Date();
  const kardex: KardexEntry[] = [];

  inventarios.forEach((inv, index) => {
    const pastDate = new Date(now.getTime() - (index * 3600000 + 86400000));
    kardex.push({
      ID_KARDEX: `KDX-INIT-${index + 100}`,
      FECHA_HORA: pastDate.toISOString(),
      ESTACION_ID: inv.ESTACION_ID,
      ESTACION: inv.ESTACION,
      PRODUCTO_ID: inv.PRODUCTO_ID,
      PRODUCTO: inv.PRODUCTO,
      CATEGORIA: inv.CATEGORIA,
      UNIDAD: inv.UNIDAD,
      TIPO_MOVIMIENTO: 'ENTRADA',
      CANTIDAD_ENTRADA: inv.STOCK_ACTUAL,
      CANTIDAD_SALIDA: 0,
      SALDO_RESULTANTE: inv.STOCK_ACTUAL,
      USUARIO: 'Sistema Inicial',
      REFERENCIA: 'INVENTARIO-INICIAL',
      OBSERVACIONES: 'Apertura de inventario inicial por estación'
    });
  });

  return kardex;
}

export const INITIAL_PRODUCCION: ProduccionDiaria[] = [
  {
    ID_PRODUCCION: 'PROD-001',
    FECHA: new Date().toISOString().split('T')[0],
    HORA_REGISTRO: '07:30',
    ESTACION_ID: 'EST-001',
    ESTACION: 'Tapirani',
    SERVICIO: 'Desayuno',
    CANTIDAD_PERSONAS: 45,
    MENU_DESCRIPCION: 'Huevos revueltos con jamón, pan fresco, jugo de plátano y café',
    CONSUMOS_ASOCIADOS: [
      { PRODUCTO_ID: 'PRD-015', PRODUCTO: 'Huevo Fresco de Gallina', UNIDAD: 'Cja', CANTIDAD_UTILIZADA: 1 },
      { PRODUCTO_ID: 'PRD-009', PRODUCTO: 'Plátano de Seda', UNIDAD: 'Kg', CANTIDAD_UTILIZADA: 5 }
    ],
    OBSERVACIONES: 'Desayuno servido a turno de mañana sin inconvenientes',
    USUARIO: 'Maria Gonzalez (Cocinera Tapirani)',
    CREADO_EL: new Date().toISOString()
  }
];

export const INITIAL_PEDIDOS: Pedido[] = [
  {
    ID_PEDIDO: 'PED-101',
    FECHA_PEDIDO: new Date().toISOString().split('T')[0],
    ESTACION_ID: 'EST-001',
    ESTACION: 'Tapirani',
    SOLICITANTE: 'Maria Gonzalez (Cocinera Tapirani)',
    ESTADO: 'Pendiente',
    ORIGEN: 'Sugerido por Sistema',
    ITEMS: [
      {
        PRODUCTO_ID: 'PRD-001',
        PRODUCTO: 'Carne de Res Lomo',
        CATEGORIA: 'Carnes y Aves',
        UNIDAD: 'Kg',
        STOCK_ACTUAL: 10,
        STOCK_MINIMO: 15,
        CANTIDAD_SOLICITADA: 30,
        OBSERVACION_ITEM: 'Stock crítico por debajo del mínimo'
      },
      {
        PRODUCTO_ID: 'PRD-010',
        PRODUCTO: 'Arroz Extra Superior',
        CATEGORIA: 'Abarrotes y Granos',
        UNIDAD: 'Saco',
        STOCK_ACTUAL: 1,
        STOCK_MINIMO: 3,
        CANTIDAD_SOLICITADA: 5,
        OBSERVACION_ITEM: 'Requerido urgente para semana'
      }
    ],
    OBSERVACIONES_GENERALES: 'Pedido semanal de abarrotes y carnes para Tapirani',
    CREADO_EL: new Date().toISOString()
  }
];
