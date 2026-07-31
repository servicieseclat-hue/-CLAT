/**
 * ERP ÉCLAT - Excel and Google Sheets Export Utilities
 * Generates .xlsx spreadsheet files and CSV files for Orders, Inventories, Kardex, and Production reports.
 */

import * as XLSX from 'xlsx';
import { Pedido, Inventario, KardexEntry, ProduccionDiaria, Consumo } from '../types';

export function exportPedidoToExcel(pedido: Pedido): void {
  const dataForSheet = pedido.ITEMS.map((item, index) => ({
    'N°': index + 1,
    'Código Product': item.PRODUCTO_ID,
    'Producto / Insumo': item.PRODUCTO,
    'Categoría': item.CATEGORIA,
    'Unidad': item.UNIDAD,
    'Stock Actual': item.STOCK_ACTUAL,
    'Stock Mínimo': item.STOCK_MINIMO,
    'Cantidad Solicitada': item.CANTIDAD_SOLICITADA,
    'Observaciones Item': item.OBSERVACION_ITEM || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

  // Add header info block at top
  XLSX.utils.sheet_add_aoa(worksheet, [
    ['SERVICIOS INTEGRALES DE LIMPIEZA Y CATERING ÉCLAT S.A.C.'],
    [`REQUERIMIENTO DE PEDIDO N°: ${pedido.ID_PEDIDO}`],
    [`Estación / Campamento: ${pedido.ESTACION}`],
    [`Solicitante: ${pedido.SOLICITANTE}`],
    [`Origen: ${pedido.ORIGEN}`],
    [`Estado: ${pedido.ESTADO}`],
    [`Fecha de Solicitud: ${pedido.FECHA_PEDIDO}`],
    [`Observaciones Generales: ${pedido.OBSERVACIONES_GENERALES || 'Sin observaciones'}`],
    [''] // Empty row before table
  ], { origin: 'A1' });

  // Re-append the items table lower down
  XLSX.utils.sheet_add_json(worksheet, dataForSheet, { origin: 'A10', skipHeader: false });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // N°
    { wch: 15 }, // ID
    { wch: 32 }, // Producto
    { wch: 22 }, // Categoria
    { wch: 10 }, // Unidad
    { wch: 14 }, // Stock Actual
    { wch: 14 }, // Stock Minimo
    { wch: 20 }, // Cantidad Solicitada
    { wch: 35 }  // Observacion
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedido');

  const fileName = `ECLAT_Pedido_${pedido.ESTACION.replace(/\s+/g, '_')}_${pedido.ID_PEDIDO}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportAllPedidosToExcel(pedidos: Pedido[], nombreEstacion: string = 'Todos los Campamentos'): void {
  const rows: any[] = [];

  pedidos.forEach((pedido) => {
    pedido.ITEMS.forEach((item, idx) => {
      rows.push({
        'N° Item': idx + 1,
        'N° Pedido': pedido.ID_PEDIDO,
        'Campamento / Estación': pedido.ESTACION,
        'Fecha Solicitud': pedido.FECHA_PEDIDO,
        'Solicitante / Cocinera': pedido.SOLICITANTE,
        'Origen': pedido.ORIGEN,
        'Estado Pedido': pedido.ESTADO,
        'Aprobado Por': pedido.APROBADO_POR || '-',
        'Fecha Aprobación': pedido.FECHA_APROBACION ? new Date(pedido.FECHA_APROBACION).toLocaleDateString() : '-',
        'Código Insumo': item.PRODUCTO_ID,
        'Producto / Insumo': item.PRODUCTO,
        'Categoría': item.CATEGORIA,
        'Unidad': item.UNIDAD,
        'Stock Actual': item.STOCK_ACTUAL,
        'Stock Mínimo': item.STOCK_MINIMO,
        'Cantidad Solicitada': item.CANTIDAD_SOLICITADA,
        'Observación / Detalle': item.OBSERVACION_ITEM || pedido.OBSERVACIONES_GENERALES || '-'
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.sheet_add_aoa(worksheet, [
    ['SERVICIOS INTEGRALES DE LIMPIEZA Y CATERING ÉCLAT S.A.C.'],
    ['PLANILLA BASE DE DATOS MASTER DE PEDIDOS Y REQUERIMIENTOS'],
    [`Filtro Campamentos: ${nombreEstacion.toUpperCase()}`],
    [`Total Pedidos Registrados: ${pedidos.length}`],
    [`Fecha de Generación: ${new Date().toLocaleString()}`],
    ['']
  ], { origin: 'A1' });

  XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A7', skipHeader: false });

  worksheet['!cols'] = [
    { wch: 8 },  // N° Item
    { wch: 14 }, // N° Pedido
    { wch: 24 }, // Campamento
    { wch: 14 }, // Fecha
    { wch: 22 }, // Solicitante
    { wch: 18 }, // Origen
    { wch: 14 }, // Estado
    { wch: 18 }, // Aprobado por
    { wch: 16 }, // Fecha aprob
    { wch: 14 }, // Cod Insumo
    { wch: 32 }, // Producto
    { wch: 20 }, // Categoria
    { wch: 10 }, // Unidad
    { wch: 12 }, // Stock Actual
    { wch: 12 }, // Stock Min
    { wch: 18 }, // Cant Solicitada
    { wch: 35 }  // Obs
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilla Pedidos');

  const fileName = `ECLAT_Planilla_Master_Pedidos_Campamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportInventarioToExcel(inventarios: Inventario[], nombreEstacion: string): void {
  const rows = inventarios.map((inv, idx) => ({
    'N°': idx + 1,
    'Estación': inv.ESTACION,
    'Código': inv.PRODUCTO_ID,
    'Producto': inv.PRODUCTO,
    'Categoría': inv.CATEGORIA,
    'Unidad': inv.UNIDAD,
    'Stock Actual': inv.STOCK_ACTUAL,
    'Stock Mínimo': inv.STOCK_MINIMO,
    'Stock Máximo': inv.STOCK_MAXIMO,
    'Estado Stock': inv.STOCK_ACTUAL < inv.STOCK_MINIMO ? 'CRÍTICO / REORDEN' : inv.STOCK_ACTUAL > inv.STOCK_MAXIMO ? 'SOBRESTOCK' : 'NORMAL',
    'Última Actualización': new Date(inv.ULTIMA_ACTUALIZACION).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.sheet_add_aoa(worksheet, [
    ['SERVICIOS INTEGRALES DE LIMPIEZA Y CATERING ÉCLAT'],
    [`INFORME DE INVENTARIO FÍSICO - ESTACIÓN: ${nombreEstacion.toUpperCase()}`],
    [`Fecha de Generación: ${new Date().toLocaleString()}`],
    ['']
  ], { origin: 'A1' });

  XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A5', skipHeader: false });

  worksheet['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 30 }, { wch: 20 },
    { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

  const fileName = `ECLAT_Inventario_${nombreEstacion.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportKardexToExcel(kardex: KardexEntry[], nombreEstacion: string): void {
  const rows = kardex.map((k, idx) => ({
    'N°': idx + 1,
    'ID Kardex': k.ID_KARDEX,
    'Fecha / Hora': new Date(k.FECHA_HORA).toLocaleString(),
    'Estación': k.ESTACION,
    'Producto': k.PRODUCTO,
    'Categoría': k.CATEGORIA,
    'Unidad': k.UNIDAD,
    'Tipo Movimiento': k.TIPO_MOVIMIENTO,
    'Entradas': k.CANTIDAD_ENTRADA || 0,
    'Salidas / Consumos': k.CANTIDAD_SALIDA || 0,
    'Saldo Resultante': k.SALDO_RESULTANTE,
    'Usuario': k.USUARIO,
    'Referencia': k.REFERENCIA,
    'Observaciones': k.OBSERVACIONES || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 28 },
    { wch: 18 }, { wch: 8 }, { wch: 16 }, { wch: 12 }, { wch: 16 },
    { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kardex Movimientos');

  const fileName = `ECLAT_Kardex_${nombreEstacion.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportProduccionToExcel(producciones: ProduccionDiaria[], nombreEstacion: string): void {
  const rows: any[] = [];

  producciones.forEach((p) => {
    p.CONSUMOS_ASOCIADOS.forEach((item) => {
      rows.push({
        'ID Producción': p.ID_PRODUCCION,
        'Fecha': p.FECHA,
        'Estación': p.ESTACION,
        'Servicio': p.SERVICIO,
        'N° Personas Atendidas': p.CANTIDAD_PERSONAS,
        'Menú Preparado': p.MENU_DESCRIPCION,
        'Insumo Consumido': item.PRODUCTO,
        'Unidad': item.UNIDAD,
        'Cantidad Usada': item.CANTIDAD_UTILIZADA,
        'Cocinera / Usuario': p.USUARIO,
        'Observaciones': p.OBSERVACIONES || ''
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Producción y Raciones');

  const fileName = `ECLAT_ProduccionDiaria_${nombreEstacion.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
