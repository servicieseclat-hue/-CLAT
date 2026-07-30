/**
 * ERP ÉCLAT - Offline Storage Engine & Data Repository
 * Handles local persistence, offline queue, 24-hour record lock, stock logic, and Kardex generation.
 */

import {
  Estacion,
  Categoria,
  Producto,
  Usuario,
  Inventario,
  Entrada,
  Consumo,
  ProduccionDiaria,
  Pedido,
  KardexEntry,
  SyncQueueItem,
  UserRole
} from '../types';

import {
  INITIAL_ESTACIONES,
  INITIAL_CATEGORIAS,
  INITIAL_PRODUCTOS,
  INITIAL_USUARIOS,
  INITIAL_PRODUCCION,
  INITIAL_PEDIDOS,
  generateInitialInventarios,
  generateInitialKardex
} from '../data/initialData';

const STORAGE_KEYS = {
  ESTACIONES: 'ECLAT_ERP_ESTACIONES',
  CATEGORIAS: 'ECLAT_ERP_CATEGORIAS',
  PRODUCTOS: 'ECLAT_ERP_PRODUCTOS',
  USUARIOS: 'ECLAT_ERP_USUARIOS',
  INVENTARIOS: 'ECLAT_ERP_INVENTARIOS',
  ENTRADAS: 'ECLAT_ERP_ENTRADAS',
  CONSUMOS: 'ECLAT_ERP_CONSUMOS',
  PRODUCCION: 'ECLAT_ERP_PRODUCCION',
  PEDIDOS: 'ECLAT_ERP_PEDIDOS',
  KARDEX: 'ECLAT_ERP_KARDEX',
  SYNC_QUEUE: 'ECLAT_ERP_SYNC_QUEUE',
  CURRENT_USER: 'ECLAT_ERP_ACTIVE_USER',
  SELECTED_STATION: 'ECLAT_ERP_SELECTED_STATION'
};

// Helper: check if record is older than 24 hours
export function isRecordLocked(createdIsoDate?: string, userRole?: UserRole): boolean {
  if (userRole === 'Administrador') {
    return false; // Admin can always edit
  }
  if (!createdIsoDate) return false;
  
  const createdTime = new Date(createdIsoDate).getTime();
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  return (now - createdTime) > ONE_DAY_MS;
}

class EclatStorageManager {
  private estaciones: Estacion[] = [];
  private categorias: Categoria[] = [];
  private productos: Producto[] = [];
  private usuarios: Usuario[] = [];
  private inventarios: Inventario[] = [];
  private entradas: Entrada[] = [];
  private consumos: Consumo[] = [];
  private produccion: ProduccionDiaria[] = [];
  private pedidos: Pedido[] = [];
  private kardex: KardexEntry[] = [];
  private syncQueue: SyncQueueItem[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const storedEstaciones = localStorage.getItem(STORAGE_KEYS.ESTACIONES);
      const storedProductos = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
      const storedUsuarios = localStorage.getItem(STORAGE_KEYS.USUARIOS);
      const storedInventarios = localStorage.getItem(STORAGE_KEYS.INVENTARIOS);

      if (!storedEstaciones || !storedProductos || !storedUsuarios || !storedInventarios) {
        // Initialize with default seeds
        this.estaciones = INITIAL_ESTACIONES;
        this.categorias = INITIAL_CATEGORIAS;
        this.productos = INITIAL_PRODUCTOS;
        this.usuarios = INITIAL_USUARIOS;
        this.inventarios = generateInitialInventarios(this.estaciones, this.productos);
        this.kardex = generateInitialKardex(this.inventarios);
        this.produccion = INITIAL_PRODUCCION;
        this.pedidos = INITIAL_PEDIDOS;
        this.entradas = [];
        this.consumos = [];
        this.syncQueue = [];

        this.saveAllToDisk();
      } else {
        this.estaciones = JSON.parse(storedEstaciones);
        this.categorias = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIAS) || JSON.stringify(INITIAL_CATEGORIAS));
        this.productos = JSON.parse(storedProductos);
        this.usuarios = JSON.parse(storedUsuarios);
        this.inventarios = JSON.parse(storedInventarios);
        this.entradas = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTRADAS) || '[]');
        this.consumos = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSUMOS) || '[]');
        this.produccion = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCCION) || JSON.stringify(INITIAL_PRODUCCION));
        this.pedidos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PEDIDOS) || JSON.stringify(INITIAL_PEDIDOS));
        this.kardex = JSON.parse(localStorage.getItem(STORAGE_KEYS.KARDEX) || '[]');
        this.syncQueue = JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE) || '[]');
      }
    } catch (e) {
      console.error('Error initializing Local Storage', e);
      this.estaciones = INITIAL_ESTACIONES;
      this.categorias = INITIAL_CATEGORIAS;
      this.productos = INITIAL_PRODUCTOS;
      this.usuarios = INITIAL_USUARIOS;
      this.inventarios = generateInitialInventarios(INITIAL_ESTACIONES, INITIAL_PRODUCTOS);
      this.kardex = generateInitialKardex(this.inventarios);
    }
  }

  private saveAllToDisk() {
    localStorage.setItem(STORAGE_KEYS.ESTACIONES, JSON.stringify(this.estaciones));
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(this.categorias));
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(this.productos));
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(this.usuarios));
    localStorage.setItem(STORAGE_KEYS.INVENTARIOS, JSON.stringify(this.inventarios));
    localStorage.setItem(STORAGE_KEYS.ENTRADAS, JSON.stringify(this.entradas));
    localStorage.setItem(STORAGE_KEYS.CONSUMOS, JSON.stringify(this.consumos));
    localStorage.setItem(STORAGE_KEYS.PRODUCCION, JSON.stringify(this.produccion));
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(this.pedidos));
    localStorage.setItem(STORAGE_KEYS.KARDEX, JSON.stringify(this.kardex));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
  }

  private enqueueSync(tabla: string, accion: 'CREATE' | 'UPDATE' | 'DELETE', datos: any) {
    const queueItem: SyncQueueItem = {
      id: `SYNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tabla,
      accion,
      datos,
      timestamp: new Date().toISOString()
    };
    this.syncQueue.unshift(queueItem);
    this.saveAllToDisk();
  }

  // --- GETTERS ---
  getEstaciones(): Estacion[] { return [...this.estaciones]; }
  getCategorias(): Categoria[] { return [...this.categorias]; }
  getProductos(): Producto[] { return [...this.productos]; }
  getUsuarios(): Usuario[] { return [...this.usuarios]; }
  getInventarios(estacionId?: string): Inventario[] {
    if (!estacionId || estacionId === 'Todas') return [...this.inventarios];
    return this.inventarios.filter(inv => inv.ESTACION_ID === estacionId);
  }
  getEntradas(estacionId?: string): Entrada[] {
    if (!estacionId || estacionId === 'Todas') return [...this.entradas];
    return this.entradas.filter(e => e.ESTACION_ID === estacionId);
  }
  getConsumos(estacionId?: string): Consumo[] {
    if (!estacionId || estacionId === 'Todas') return [...this.consumos];
    return this.consumos.filter(c => c.ESTACION_ID === estacionId);
  }
  getProduccion(estacionId?: string): ProduccionDiaria[] {
    if (!estacionId || estacionId === 'Todas') return [...this.produccion];
    return this.produccion.filter(p => p.ESTACION_ID === estacionId);
  }
  getPedidos(estacionId?: string): Pedido[] {
    if (!estacionId || estacionId === 'Todas') return [...this.pedidos];
    return this.pedidos.filter(p => p.ESTACION_ID === estacionId);
  }
  getKardex(estacionId?: string, productoId?: string): KardexEntry[] {
    let list = [...this.kardex];
    if (estacionId && estacionId !== 'Todas') {
      list = list.filter(k => k.ESTACION_ID === estacionId);
    }
    if (productoId && productoId !== 'Todos') {
      list = list.filter(k => k.PRODUCTO_ID === productoId);
    }
    return list.sort((a, b) => new Date(b.FECHA_HORA).getTime() - new Date(a.FECHA_HORA).getTime());
  }
  getSyncQueue(): SyncQueueItem[] { return [...this.syncQueue]; }

  // Clear sync queue after sync
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveAllToDisk();
  }

  // Restore factory seed data
  resetToDefaultSeeds() {
    localStorage.clear();
    this.initStorage();
  }

  // --- INVENTORY LOGIC & KARDEX ---
  private getOrCreateInventarioItem(estacionId: string, productoId: string): Inventario {
    let item = this.inventarios.find(i => i.ESTACION_ID === estacionId && i.PRODUCTO_ID === productoId);
    if (!item) {
      const estacion = this.estaciones.find(e => e.ID_ESTACION === estacionId);
      const producto = this.productos.find(p => p.ID_PRODUCTO === productoId);
      item = {
        ID_INVENTARIO: `INV-${estacionId}-${productoId}`,
        ESTACION_ID: estacionId,
        ESTACION: estacion?.ESTACION || 'Desconocida',
        PRODUCTO_ID: productoId,
        PRODUCTO: producto?.PRODUCTO || 'Producto',
        CATEGORIA: producto?.CATEGORIA || 'Sin Categoría',
        UNIDAD: producto?.UNIDAD || 'Unid',
        STOCK_ACTUAL: 0,
        STOCK_MINIMO: producto?.STOCK_MINIMO || 5,
        STOCK_MAXIMO: producto?.STOCK_MAXIMO || 50,
        ULTIMA_ACTUALIZACION: new Date().toISOString()
      };
      this.inventarios.push(item);
    }
    return item;
  }

  // --- ENTRADAS (Recepción de productos) ---
  addEntrada(entrada: Omit<Entrada, 'ID_ENTRADA' | 'CREADO_EL'>): { success: boolean; error?: string } {
    const nowIso = new Date().toISOString();
    const idEntrada = `ENT-${Date.now().toString().slice(-6)}`;
    const newEntrada: Entrada = {
      ...entrada,
      ID_ENTRADA: idEntrada,
      CREADO_EL: nowIso
    };

    // Update Stock
    const invItem = this.getOrCreateInventarioItem(entrada.ESTACION_ID, entrada.PRODUCTO_ID);
    invItem.STOCK_ACTUAL += Number(entrada.CANTIDAD);
    invItem.ULTIMA_ACTUALIZACION = nowIso;

    // Generate Kardex
    const kardexEntry: KardexEntry = {
      ID_KARDEX: `KDX-${Date.now().toString().slice(-6)}`,
      FECHA_HORA: entrada.FECHA_HORA || nowIso,
      ESTACION_ID: entrada.ESTACION_ID,
      ESTACION: entrada.ESTACION,
      PRODUCTO_ID: entrada.PRODUCTO_ID,
      PRODUCTO: entrada.PRODUCTO,
      CATEGORIA: invItem.CATEGORIA,
      UNIDAD: entrada.UNIDAD,
      TIPO_MOVIMIENTO: 'ENTRADA',
      CANTIDAD_ENTRADA: Number(entrada.CANTIDAD),
      CANTIDAD_SALIDA: 0,
      SALDO_RESULTANTE: invItem.STOCK_ACTUAL,
      USUARIO: entrada.USUARIO,
      REFERENCIA: idEntrada,
      OBSERVACIONES: `Recepcion de ${entrada.PROVEEDOR}: ${entrada.OBSERVACIONES || ''}`
    };

    this.entradas.unshift(newEntrada);
    this.kardex.unshift(kardexEntry);
    this.enqueueSync('Entradas', 'CREATE', newEntrada);
    this.saveAllToDisk();

    return { success: true };
  }

  // --- CONSUMOS (Salidas) ---
  addConsumo(consumo: Omit<Consumo, 'ID_CONSUMO' | 'CREADO_EL'>): { success: boolean; error?: string } {
    const invItem = this.getOrCreateInventarioItem(consumo.ESTACION_ID, consumo.PRODUCTO_ID);
    const cantidadRequerida = Number(consumo.CANTIDAD);

    // Prevent negative stock!
    if (invItem.STOCK_ACTUAL < cantidadRequerida) {
      return {
        success: false,
        error: `Stock insuficiente en ${consumo.ESTACION}. Stock actual: ${invItem.STOCK_ACTUAL} ${invItem.UNIDAD}, Requerido: ${cantidadRequerida} ${invItem.UNIDAD}`
      };
    }

    const nowIso = new Date().toISOString();
    const idConsumo = `CON-${Date.now().toString().slice(-6)}`;
    const newConsumo: Consumo = {
      ...consumo,
      ID_CONSUMO: idConsumo,
      CREADO_EL: nowIso
    };

    invItem.STOCK_ACTUAL -= cantidadRequerida;
    invItem.ULTIMA_ACTUALIZACION = nowIso;

    const kardexEntry: KardexEntry = {
      ID_KARDEX: `KDX-${Date.now().toString().slice(-6)}`,
      FECHA_HORA: consumo.FECHA_HORA || nowIso,
      ESTACION_ID: consumo.ESTACION_ID,
      ESTACION: consumo.ESTACION,
      PRODUCTO_ID: consumo.PRODUCTO_ID,
      PRODUCTO: consumo.PRODUCTO,
      CATEGORIA: invItem.CATEGORIA,
      UNIDAD: consumo.UNIDAD,
      TIPO_MOVIMIENTO: 'CONSUMO',
      CANTIDAD_ENTRADA: 0,
      CANTIDAD_SALIDA: cantidadRequerida,
      SALDO_RESULTANTE: invItem.STOCK_ACTUAL,
      USUARIO: consumo.USUARIO,
      REFERENCIA: idConsumo,
      OBSERVACIONES: `Consumo (${consumo.TIPO_CONSUMO}): ${consumo.OBSERVACIONES || ''}`
    };

    this.consumos.unshift(newConsumo);
    this.kardex.unshift(kardexEntry);
    this.enqueueSync('Consumos', 'CREATE', newConsumo);
    this.saveAllToDisk();

    return { success: true };
  }

  // --- PRODUCCION DIARIA ---
  addProduccionDiaria(produccion: Omit<ProduccionDiaria, 'ID_PRODUCCION' | 'CREADO_EL'>): { success: boolean; error?: string } {
    // Check stock for all recipe products
    for (const item of produccion.CONSUMOS_ASOCIADOS) {
      const inv = this.getOrCreateInventarioItem(produccion.ESTACION_ID, item.PRODUCTO_ID);
      if (inv.STOCK_ACTUAL < Number(item.CANTIDAD_UTILIZADA)) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.PRODUCTO} en ${produccion.ESTACION}. Disponibles: ${inv.STOCK_ACTUAL} ${item.UNIDAD}`
        };
      }
    }

    const nowIso = new Date().toISOString();
    const idProduccion = `PROD-${Date.now().toString().slice(-6)}`;
    const newProduccion: ProduccionDiaria = {
      ...produccion,
      ID_PRODUCCION: idProduccion,
      CREADO_EL: nowIso
    };

    // Deduct stock & create Kardex for each consumed item
    for (const item of produccion.CONSUMOS_ASOCIADOS) {
      const inv = this.getOrCreateInventarioItem(produccion.ESTACION_ID, item.PRODUCTO_ID);
      const qty = Number(item.CANTIDAD_UTILIZADA);
      inv.STOCK_ACTUAL -= qty;
      inv.ULTIMA_ACTUALIZACION = nowIso;

      const kardexEntry: KardexEntry = {
        ID_KARDEX: `KDX-PROD-${Date.now().toString().slice(-6)}-${item.PRODUCTO_ID}`,
        FECHA_HORA: nowIso,
        ESTACION_ID: produccion.ESTACION_ID,
        ESTACION: produccion.ESTACION,
        PRODUCTO_ID: item.PRODUCTO_ID,
        PRODUCTO: item.PRODUCTO,
        CATEGORIA: inv.CATEGORIA,
        UNIDAD: item.UNIDAD,
        TIPO_MOVIMIENTO: 'PRODUCCION',
        CANTIDAD_ENTRADA: 0,
        CANTIDAD_SALIDA: qty,
        SALDO_RESULTANTE: inv.STOCK_ACTUAL,
        USUARIO: produccion.USUARIO,
        REFERENCIA: idProduccion,
        OBSERVACIONES: `Producción de ${produccion.SERVICIO} (${produccion.CANTIDAD_PERSONAS} raciones)`
      };
      this.kardex.unshift(kardexEntry);
    }

    this.produccion.unshift(newProduccion);
    this.enqueueSync('ProduccionDiaria', 'CREATE', newProduccion);
    this.saveAllToDisk();

    return { success: true };
  }

  // --- PEDIDOS (Order Creation & Suggestions) ---
  addPedido(pedido: Omit<Pedido, 'ID_PEDIDO' | 'CREADO_EL'>): { success: boolean; error?: string } {
    const nowIso = new Date().toISOString();
    const newPedido: Pedido = {
      ...pedido,
      ID_PEDIDO: `PED-${Date.now().toString().slice(-5)}`,
      CREADO_EL: nowIso
    };
    this.pedidos.unshift(newPedido);
    this.enqueueSync('Pedidos', 'CREATE', newPedido);
    this.saveAllToDisk();
    return { success: true };
  }

  // Auto-generate suggested purchase order for a station when stock < min
  generateSuggestedOrder(estacionId: string, solicitante: string): Pedido | null {
    const stationInventories = this.getInventarios(estacionId);
    const lowStockItems = stationInventories.filter(i => i.STOCK_ACTUAL < i.STOCK_MINIMO);

    if (lowStockItems.length === 0) return null;

    const station = this.estaciones.find(e => e.ID_ESTACION === estacionId);
    const nowIso = new Date().toISOString();

    const orderItems = lowStockItems.map(inv => {
      const suggestedQty = inv.STOCK_MAXIMO - inv.STOCK_ACTUAL;
      return {
        PRODUCTO_ID: inv.PRODUCTO_ID,
        PRODUCTO: inv.PRODUCTO,
        CATEGORIA: inv.CATEGORIA,
        UNIDAD: inv.UNIDAD,
        STOCK_ACTUAL: inv.STOCK_ACTUAL,
        STOCK_MINIMO: inv.STOCK_MINIMO,
        CANTIDAD_SOLICITADA: Math.max(suggestedQty, 1),
        OBSERVACION_ITEM: `Stock actual (${inv.STOCK_ACTUAL}) por debajo del mínimo (${inv.STOCK_MINIMO})`
      };
    });

    const newPedido: Pedido = {
      ID_PEDIDO: `PED-SUG-${Date.now().toString().slice(-4)}`,
      FECHA_PEDIDO: new Date().toISOString().split('T')[0],
      ESTACION_ID: estacionId,
      ESTACION: station?.ESTACION || 'Estación',
      SOLICITANTE: solicitante,
      ESTADO: 'Sugerido',
      ORIGEN: 'Sugerido por Sistema',
      ITEMS: orderItems,
      OBSERVACIONES_GENERALES: 'Sugerencia automática de reabastecimiento generada por el ERP ÉCLAT',
      CREADO_EL: nowIso
    };

    this.pedidos.unshift(newPedido);
    this.enqueueSync('Pedidos', 'CREATE', newPedido);
    this.saveAllToDisk();
    return newPedido;
  }

  updatePedidoEstado(pedidoId: string, nuevoEstado: Pedido['ESTADO'], aprobadoPor: string): { success: boolean } {
    const p = this.pedidos.find(x => x.ID_PEDIDO === pedidoId);
    if (p) {
      p.ESTADO = nuevoEstado;
      p.FECHA_APROBACION = new Date().toISOString();
      p.APROBADO_POR = aprobadoPor;
      this.enqueueSync('Pedidos', 'UPDATE', p);
      this.saveAllToDisk();
      return { success: true };
    }
    return { success: false };
  }

  // --- PRODUCT CATALOG MANAGEMENT (Admin Only) ---
  addProducto(producto: Omit<Producto, 'ID_PRODUCTO'>, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede añadir productos al catálogo.' };
    }
    const newId = `PRD-${(this.productos.length + 1).toString().padStart(3, '0')}`;
    const newProduct: Producto = {
      ...producto,
      ID_PRODUCTO: newId
    };
    this.productos.push(newProduct);

    // Initialize stock records for all stations
    this.estaciones.forEach(est => {
      this.getOrCreateInventarioItem(est.ID_ESTACION, newId);
    });

    this.enqueueSync('Productos', 'CREATE', newProduct);
    this.saveAllToDisk();
    return { success: true };
  }

  updateProducto(producto: Producto, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede editar productos.' };
    }
    const idx = this.productos.findIndex(p => p.ID_PRODUCTO === producto.ID_PRODUCTO);
    if (idx !== -1) {
      this.productos[idx] = { ...producto };
      // Update inventory metadata
      this.inventarios.forEach(inv => {
        if (inv.PRODUCTO_ID === producto.ID_PRODUCTO) {
          inv.PRODUCTO = producto.PRODUCTO;
          inv.CATEGORIA = producto.CATEGORIA;
          inv.UNIDAD = producto.UNIDAD;
          inv.STOCK_MINIMO = producto.STOCK_MINIMO;
          inv.STOCK_MAXIMO = producto.STOCK_MAXIMO;
        }
      });
      this.enqueueSync('Productos', 'UPDATE', producto);
      this.saveAllToDisk();
      return { success: true };
    }
    return { success: false, error: 'Producto no encontrado' };
  }

  deleteProducto(productoId: string, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede eliminar o desactivar productos.' };
    }
    const prd = this.productos.find(p => p.ID_PRODUCTO === productoId);
    if (prd) {
      prd.ACTIVO = false; // Soft delete
      this.enqueueSync('Productos', 'UPDATE', prd);
      this.saveAllToDisk();
      return { success: true };
    }
    return { success: false, error: 'Producto no encontrado' };
  }

  // --- MANUAL STOCK ADJUSTMENT (Admin Only) ---
  adjustStockManual(
    estacionId: string,
    productoId: string,
    nuevoStock: number,
    motivo: string,
    usuario: string,
    userRole: UserRole
  ): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Solo el Administrador puede realizar ajustes directos de stock.' };
    }

    const inv = this.getOrCreateInventarioItem(estacionId, productoId);
    const stockAnterior = inv.STOCK_ACTUAL;
    const diferencia = nuevoStock - stockAnterior;

    inv.STOCK_ACTUAL = nuevoStock;
    inv.ULTIMA_ACTUALIZACION = new Date().toISOString();

    const kardexEntry: KardexEntry = {
      ID_KARDEX: `KDX-ADJ-${Date.now().toString().slice(-6)}`,
      FECHA_HORA: new Date().toISOString(),
      ESTACION_ID: estacionId,
      ESTACION: inv.ESTACION,
      PRODUCTO_ID: productoId,
      PRODUCTO: inv.PRODUCTO,
      CATEGORIA: inv.CATEGORIA,
      UNIDAD: inv.UNIDAD,
      TIPO_MOVIMIENTO: 'AJUSTE',
      CANTIDAD_ENTRADA: diferencia > 0 ? diferencia : 0,
      CANTIDAD_SALIDA: diferencia < 0 ? Math.abs(diferencia) : 0,
      SALDO_RESULTANTE: nuevoStock,
      USUARIO: usuario,
      REFERENCIA: 'AJUSTE-MANUAL-ADMIN',
      OBSERVACIONES: `Ajuste directo de inventario: ${motivo}`
    };

    this.kardex.unshift(kardexEntry);
    this.enqueueSync('Inventarios', 'UPDATE', inv);
    this.saveAllToDisk();

    return { success: true };
  }

  // --- USER MANAGEMENT (Admin Only) ---
  addUsuario(usuario: Omit<Usuario, 'ID_USUARIO'>, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede registrar personal.' };
    }
    const newId = `USR-${(this.usuarios.length + 1).toString().padStart(3, '0')}`;
    const newUsr: Usuario = {
      ...usuario,
      ID_USUARIO: newId
    };
    this.usuarios.push(newUsr);
    this.enqueueSync('Usuarios', 'CREATE', newUsr);
    this.saveAllToDisk();
    return { success: true };
  }

  updateUsuario(usuario: Usuario, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede modificar personal.' };
    }
    const idx = this.usuarios.findIndex(u => u.ID_USUARIO === usuario.ID_USUARIO);
    if (idx !== -1) {
      this.usuarios[idx] = { ...usuario };
      this.enqueueSync('Usuarios', 'UPDATE', usuario);
      this.saveAllToDisk();
      return { success: true };
    }
    return { success: false, error: 'Usuario no encontrado' };
  }

  // --- STATIONS MANAGEMENT ---
  addEstacion(estacion: Omit<Estacion, 'ID_ESTACION'>, userRole: UserRole): { success: boolean; error?: string } {
    if (userRole !== 'Administrador') {
      return { success: false, error: 'Acceso denegado.' };
    }
    const newId = `EST-${(this.estaciones.length + 1).toString().padStart(3, '0')}`;
    const newEst: Estacion = { ...estacion, ID_ESTACION: newId };
    this.estaciones.push(newEst);

    // Generate inventory records for new station
    this.productos.forEach(p => {
      this.getOrCreateInventarioItem(newId, p.ID_PRODUCTO);
    });

    this.enqueueSync('Estaciones', 'CREATE', newEst);
    this.saveAllToDisk();
    return { success: true };
  }

  // Delete/Cancel records older than 24h checks
  deleteConsumo(consumoId: string, userRole: UserRole): { success: boolean; error?: string } {
    const consumo = this.consumos.find(c => c.ID_CONSUMO === consumoId);
    if (!consumo) return { success: false, error: 'Consumo no encontrado' };

    if (isRecordLocked(consumo.CREADO_EL, userRole)) {
      return {
        success: false,
        error: 'Registro bloqueado: Han transcurrido más de 24 horas. Solo el Administrador puede modificar o eliminar este registro.'
      };
    }

    // Revert inventory stock
    const inv = this.getOrCreateInventarioItem(consumo.ESTACION_ID, consumo.PRODUCTO_ID);
    inv.STOCK_ACTUAL += consumo.CANTIDAD;

    this.consumos = this.consumos.filter(c => c.ID_CONSUMO !== consumoId);
    this.enqueueSync('Consumos', 'DELETE', { ID_CONSUMO: consumoId });
    this.saveAllToDisk();
    return { success: true };
  }
}

export const Storage = new EclatStorageManager();
