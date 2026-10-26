'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Filter, Calendar, Truck, Search, 
  Clock, AlertTriangle, MessageCircle, Eye, Download, 
  CheckCircle2, XCircle, ArrowRight, Loader2, RefreshCw, 
  MapPin, Phone, Mail, FileText, Check, ShieldCheck, Tag, Store
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPEN } from '@/utils/currency';

interface PedidoItem {
  id: string;
  codigo: string;
  estado: string;
  items: any[];
  pedido_items?: any[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  cliente_nombre: string;
  cliente_celular: string;
  cliente_email?: string;
  tipo_comprobante: string;
  dni_ruc?: string;
  razon_social?: string;
  metodo_entrega: string;
  direccion_entrega?: string;
  agencia_envio?: string;
  notas?: string;
  codigo_seguimiento?: string;
  notas_internas?: string;
  metodo_pago?: string;
  numero_operacion?: string;
  token: string;
  created_at: string;
}

interface AdminOrdersManagerProps {
  initialCodigo?: string;
}

export function AdminOrdersManager({ initialCodigo }: AdminOrdersManagerProps = {}) {
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<PedidoItem | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroEntrega, setFiltroEntrega] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modal para Marcar como Pagado
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pedidoParaPagar, setPedidoParaPagar] = useState<PedidoItem | null>(null);
  const [metodoPagoInput, setMetodoPagoInput] = useState('Yape');
  const [nroOperacionInput, setNroOperacionInput] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [ahora, setAhora] = useState<number>(0);

  useEffect(() => {
    setAhora(Date.now());
  }, [pedidos]);

  // Plantillas de WhatsApp cargadas desde la BD
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [datosPagoAjustes, setDatosPagoAjustes] = useState<any>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, pedido_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPedidos(data);
        if (initialCodigo) {
          const match = data.find((p: any) => p.codigo === initialCodigo);
          if (match) {
            setSelectedPedido(match);
            fetchHistorial(match.id);
          }
        }
      }

      // Cargar plantillas
      const { data: pts } = await supabase.from('plantillas_whatsapp').select('*');
      if (pts) setPlantillas(pts);

      // Cargar datos de pago
      const { data: aj } = await supabase.from('ajustes_generales').select('valor').eq('clave', 'datos_pago_plantillas').single();
      if (aj?.valor) setDatosPagoAjustes(aj.valor);
    } catch (err) {
      console.error('Error al cargar pedidos en admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchHistorial = async (pedidoId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('pedido_historial')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: false });
    setHistorial(data || []);
  };

  const handleOpenDetail = (p: PedidoItem) => {
    setSelectedPedido(p);
    fetchHistorial(p.id);
  };

  // Cambiar estado estándar
  const handleCambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    if (nuevoEstado === 'pagado') {
      const ped = pedidos.find((p) => p.id === pedidoId);
      if (ped) {
        setPedidoParaPagar(ped);
        setMetodoPagoInput('Yape');
        setNroOperacionInput('');
        setStockWarning(null);
        setModalPagoOpen(true);
      }
      return;
    }

    try {
      const res = await fetch('/api/admin/pedidos/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: pedidoId, nuevo_estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPedidos();
        if (selectedPedido && selectedPedido.id === pedidoId) {
          setSelectedPedido({ ...selectedPedido, estado: nuevoEstado });
          fetchHistorial(pedidoId);
        }
      }
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  // Confirmar pago con descuento de stock
  const handleConfirmarPago = async (forzar = false) => {
    if (!pedidoParaPagar) return;
    setProcesandoPago(true);
    setStockWarning(null);

    try {
      const res = await fetch('/api/admin/pedidos/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: pedidoParaPagar.id,
          nuevo_estado: 'pagado',
          metodo_pago: metodoPagoInput,
          numero_operacion: nroOperacionInput.trim(),
          forzar_sin_stock: forzar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.warning_stock) {
          setStockWarning(data.error);
        } else {
          alert(data.error || 'Error al procesar pago');
        }
        return;
      }

      setModalPagoOpen(false);
      setPedidoParaPagar(null);
      fetchPedidos();
      if (selectedPedido && selectedPedido.id === pedidoParaPagar.id) {
        setSelectedPedido({
          ...selectedPedido,
          estado: 'pagado',
          metodo_pago: metodoPagoInput,
          numero_operacion: nroOperacionInput.trim(),
        });
        fetchHistorial(selectedPedido.id);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcesandoPago(false);
    }
  };

  // Guardar código de seguimiento de agencia
  const handleGuardarSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPedido) return;

    try {
      await fetch('/api/admin/pedidos/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: selectedPedido.id,
          nuevo_estado: selectedPedido.estado,
          codigo_seguimiento: selectedPedido.codigo_seguimiento,
          notas_internas: selectedPedido.notas_internas,
        }),
      });
      alert('Información guardada correctamente.');
      fetchPedidos();
    } catch {
      alert('Error al guardar datos.');
    }
  };

  // Generador de plantillas de WhatsApp para el chat con el cliente
  const getUrlWhatsAppPlantilla = (p: PedidoItem, tipoPlantilla: string) => {
    const celLimpio = (p.cliente_celular || '').replace(/\D/g, '');
    let texto = '';

    const bancoDefecto = datosPagoAjustes?.bancos?.[0] || { banco: 'BCP', cuenta: '191-94820158-0-44', cci: '002-191009482015804452' };
    const titular = datosPagoAjustes?.titular || 'Kiara Balarezo Berttea / IORI SAC';
    const numeroYape = datosPagoAjustes?.numero_yape_plin || '905 445 698';

    if (tipoPlantilla === 'instrucciones_pago') {
      texto = `¡Hola, ${p.cliente_nombre}! Gracias por tu pedido *${p.codigo}* 🙌 Confirmamos stock de todo. Total a pagar: *${formatPEN(p.total)}*.

Puedes pagar con:
- Yape o Plin: ${numeroYape} (a nombre de ${titular})
- Transferencia ${bancoDefecto.banco}: cuenta ${bancoDefecto.cuenta} / CCI ${bancoDefecto.cci}

Te enviamos el QR en el siguiente mensaje. Cuando pagues, mándanos la captura por aquí y preparamos tu pedido.`;
    } else if (tipoPlantilla === 'pago_confirmado') {
      texto = `¡Pago recibido, ${p.cliente_nombre}! ✅ Tu pedido *${p.codigo}* está confirmado y ya lo estamos preparando. Te avisamos por aquí en cuanto salga o esté listo para recoger.`;
    } else if (tipoPlantilla === 'en_camino') {
      if (p.metodo_entrega === 'provincia_agencia') {
        texto = `¡Tu pedido *${p.codigo}* ya va en camino, ${p.cliente_nombre}! 🏍️
Agencia: ${p.agencia_envio || 'Shalom'}
Código de seguimiento: ${p.codigo_seguimiento || 'Por registrar'}
Destino: ${p.direccion_entrega || 'Provincia'}
Para recogerlo en la agencia, lleva tu DNI.`;
      } else {
        texto = `¡Tu pedido *${p.codigo}* ya salió, ${p.cliente_nombre}! 🏍️ Lo entregamos en ${p.direccion_entrega || 'tu dirección'} hoy. Te llamaremos antes de llegar.`;
      }
    } else if (tipoPlantilla === 'listo_recojo') {
      const tienda = p.metodo_entrega === 'recojo_la_victoria' ? 'La Victoria' : 'Independencia';
      const dir = p.metodo_entrega === 'recojo_la_victoria' ? 'Av. Nicolás Arriola 901' : 'Av. Contisuyo 418, Tahuantinsuyo';
      texto = `¡Tu pedido *${p.codigo}* ya está listo, ${p.cliente_nombre}! 🙌 Recógelo en nuestra tienda de ${tienda} (${dir}). Menciona tu número de pedido al llegar.`;
    } else if (tipoPlantilla === 'pedido_sin_mensaje') {
      texto = `Hola, ${p.cliente_nombre} 👋 Te escribimos de Iori Biker Shop. Registraste el pedido *${p.codigo}* en nuestra web, pero no nos llegó tu mensaje. ¿Te ayudamos a completarlo?`;
    }

    return `https://wa.me/51${celLimpio}?text=${encodeURIComponent(texto)}`;
  };

  // Exportar pedidos a Excel (.csv compatible con Excel)
  const handleExportExcel = () => {
    const headers = [
      'Codigo', 'Fecha', 'Estado', 'Cliente', 'Celular', 'Email', 
      'Comprobante', 'DNI_RUC', 'Razon_Social', 'Metodo_Entrega', 
      'Direccion', 'Agencia', 'Seguimiento', 'Metodo_Pago', 'Nro_Operacion',
      'Subtotal', 'Descuento', 'Envio', 'Total'
    ];

    const rows = pedidos.map((p) => [
      `"${p.codigo}"`,
      `"${new Date(p.created_at).toLocaleString('es-PE')}"`,
      `"${p.estado}"`,
      `"${(p.cliente_nombre || '').replace(/"/g, '""')}"`,
      `"${p.cliente_celular}"`,
      `"${p.cliente_email || ''}"`,
      `"${p.tipo_comprobante}"`,
      `"${p.dni_ruc || ''}"`,
      `"${(p.razon_social || '').replace(/"/g, '""')}"`,
      `"${p.metodo_entrega}"`,
      `"${(p.direccion_entrega || '').replace(/"/g, '""')}"`,
      `"${p.agencia_envio || ''}"`,
      `"${p.codigo_seguimiento || ''}"`,
      `"${p.metodo_pago || ''}"`,
      `"${p.numero_operacion || ''}"`,
      p.subtotal,
      p.descuento,
      p.envio,
      p.total,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedidos_iori_biker_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    if (filtroEntrega !== 'todos' && p.metodo_entrega !== filtroEntrega) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchCod = p.codigo.toLowerCase().includes(q);
      const matchCli = p.cliente_nombre.toLowerCase().includes(q);
      const matchCel = p.cliente_celular.includes(q);
      if (!matchCod && !matchCli && !matchCel) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Barra Superior con Filtros y Exportar */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
              Gestor de Pedidos de WhatsApp ({pedidosFiltrados.length})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Control de estados, verificación de pagos, stock en tiempo real y plantillas de atención.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Excel (.csv)
            </button>
            <button
              type="button"
              onClick={fetchPedidos}
              disabled={loading}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition cursor-pointer"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Código, cliente, celular..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-300 rounded-xl bg-white"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white font-bold"
            >
              <option value="todos">Todos los Estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="esperando_pago">Esperando Pago</option>
              <option value="pagado">Pagado</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="en_camino">En Camino</option>
              <option value="listo_recojo">Listo para Recojo</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Método de Entrega</label>
            <select
              value={filtroEntrega}
              onChange={(e) => setFiltroEntrega(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white font-bold"
            >
              <option value="todos">Todas las Modalidades</option>
              <option value="recojo_independencia">Recojo Sede Independencia</option>
              <option value="recojo_la_victoria">Recojo Sede La Victoria</option>
              <option value="lima_domicilio">Delivery Lima</option>
              <option value="provincia_agencia">Envío a Provincia (Agencia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand mb-2" />
          <span className="text-xs font-bold uppercase">Cargando pedidos...</span>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-zinc-400 border border-zinc-200">
          <ShoppingCart className="w-12 h-12 mx-auto text-zinc-300 mb-2" />
          <p className="font-bold text-sm text-zinc-600">No se encontraron pedidos con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((p) => {
            // Regla: Resaltar los pedidos que siguen en "Nuevo" después de 1 hora
            const fechaPedido = new Date(p.created_at).getTime();
            const diferenciaHoras = ahora > 0 ? (ahora - fechaPedido) / (1000 * 60 * 60) : 0;
            const esNuevoAlerta = p.estado === 'nuevo' && diferenciaHoras >= 1;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl border transition-all ${
                  esNuevoAlerta
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300/50 shadow-md'
                    : 'bg-white border-zinc-200 shadow-xs hover:border-zinc-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Encabezado del Pedido */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-black text-[#f58220] font-heading font-black text-xs uppercase rounded-lg">
                        {p.codigo}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        p.estado === 'nuevo' ? 'bg-blue-100 text-blue-800' :
                        p.estado === 'pagado' ? 'bg-emerald-100 text-emerald-800' :
                        p.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {p.estado.replace('_', ' ')}
                      </span>

                      {esNuevoAlerta && (
                        <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Sin mensaje de WhatsApp tras 1h
                        </span>
                      )}

                      <span className="text-xs text-zinc-400">
                        {new Date(p.created_at).toLocaleString('es-PE')}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <span>{p.cliente_nombre}</span>
                      <span className="text-zinc-400 font-normal">• Cel: {p.cliente_celular}</span>
                    </div>

                    <div className="text-xs text-zinc-500">
                      Entrega: <b className="text-zinc-700">{p.direccion_entrega || p.metodo_entrega}</b>
                    </div>
                  </div>

                  {/* Acciones Rápidas y Selector de Estado */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="text-right mr-3">
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">Total Pedido</span>
                      <span className="font-heading font-black text-xl text-black">
                        {formatPEN(p.total)}
                      </span>
                    </div>

                    {/* Selector de Estado */}
                    <select
                      value={p.estado}
                      onChange={(e) => handleCambiarEstado(p.id, e.target.value)}
                      className="text-xs font-bold uppercase px-3 py-2 rounded-xl border border-zinc-300 bg-white"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="esperando_pago">Esperando Pago</option>
                      <option value="pagado">Pagado (Descuenta Stock)</option>
                      <option value="en_preparacion">En Preparación</option>
                      <option value="en_camino">En Camino</option>
                      <option value="listo_recojo">Listo Recojo</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado (Devuelve Stock)</option>
                    </select>

                    {/* Menú de Botones WhatsApp con Plantillas */}
                    <div className="flex items-center gap-1.5">
                      {esNuevoAlerta && (
                        <a
                          href={getUrlWhatsAppPlantilla(p, 'pedido_sin_mensaje')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="Enviar plantilla Pedido sin Mensaje"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Reclamar WhatsApp
                        </a>
                      )}

                      <a
                        href={getUrlWhatsAppPlantilla(p, 'instrucciones_pago')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        title="Enviar Instrucciones de Pago"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Datos Pago
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenDetail(p)}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detalle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CONFIRMAR PAGO Y DESCONTAR STOCK */}
      {modalPagoOpen && pedidoParaPagar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-heading font-black text-lg uppercase tracking-wider text-black">
                  Confirmar Pago: {pedidoParaPagar.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPagoOpen(false)}
                className="text-zinc-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600">
              Al registrar el pago se <b>descontará el stock automáticamente</b> de cada variante en el inventario.
            </p>

            {stockWarning && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-xs text-red-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-700 uppercase">
                  <AlertTriangle className="w-4 h-4" /> Advertencia de Inventario
                </div>
                <p className="whitespace-pre-line font-mono text-[11px]">{stockWarning}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmarPago(true)}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                  >
                    Confirmar de todas formas (Forzar)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Método de Pago Empleado *
                </label>
                <select
                  value={metodoPagoInput}
                  onChange={(e) => setMetodoPagoInput(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white font-bold"
                >
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia BCP">Transferencia BCP</option>
                  <option value="Transferencia BBVA">Transferencia BBVA</option>
                  <option value="Transferencia Interbank">Transferencia Interbank</option>
                  <option value="Efectivo en Tienda">Efectivo en Tienda</option>
                  <option value="Tarjeta POS Tienda">Tarjeta POS Tienda</option>
                  <option value="Otro">Otro medio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Número de Operación Bancaria / Comprobante
                </label>
                <input
                  type="text"
                  placeholder="Ej. OP-9847192 o código de Yape"
                  value={nroOperacionInput}
                  onChange={(e) => setNroOperacionInput(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setModalPagoOpen(false)}
                className="px-4 py-2.5 bg-zinc-100 text-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarPago(false)}
                disabled={procesandoPago}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {procesandoPago ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirmar Pago y Descontar Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE COMPLETO DEL PEDIDO */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-black uppercase text-brand tracking-widest bg-orange-100 px-2 py-0.5 rounded">
                  Detalle del Pedido
                </span>
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-black mt-1">
                  {selectedPedido.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="p-2 text-zinc-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Datos del Cliente y Facturación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-700 border border-zinc-200">
              <div>
                <span className="font-bold text-zinc-900 block mb-1">Cliente:</span>
                <p className="font-bold">{selectedPedido.cliente_nombre}</p>
                <p>Celular: {selectedPedido.cliente_celular}</p>
                <p>Email: {selectedPedido.cliente_email || '-'}</p>
              </div>

              <div>
                <span className="font-bold text-zinc-900 block mb-1">Comprobante:</span>
                <p className="capitalize font-bold">{selectedPedido.tipo_comprobante}</p>
                <p>Doc: {selectedPedido.dni_ruc || '-'}</p>
                {selectedPedido.razon_social && <p>Razón Social: {selectedPedido.razon_social}</p>}
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-zinc-900 block mb-1">Entrega:</span>
                <p>{selectedPedido.direccion_entrega || selectedPedido.metodo_entrega}</p>
              </div>

              {selectedPedido.notas && (
                <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-zinc-200">
                  <span className="font-bold text-zinc-900 block mb-0.5">Notas del Cliente:</span>
                  <p>{selectedPedido.notas}</p>
                </div>
              )}
            </div>

            {/* Ítems del Pedido */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-sm uppercase text-black">
                Productos Comprados ({selectedPedido.pedido_items?.length || 0})
              </h4>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden p-2">
                {(selectedPedido.pedido_items || selectedPedido.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-zinc-900">{it.producto_nombre}</p>
                      <p className="text-zinc-500 text-[11px]">
                        {it.variante_nombre ? `${it.variante_nombre} • ` : ''}SKU: {it.sku} • Cant: {it.cantidad}
                      </p>
                    </div>
                    <span className="font-heading font-bold text-sm text-zinc-900">
                      {formatPEN(it.subtotal || it.precio_unitario * it.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulario de Código de Seguimiento de Agencia y Notas Internas */}
            <form onSubmit={handleGuardarSeguimiento} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <span className="font-bold text-xs uppercase text-zinc-800 block">
                Logística y Seguimiento de Agencia (Shalom / Marvisur / Courier)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Código de Seguimiento / Guía
                  </label>
                  <input
                    type="text"
                    value={selectedPedido.codigo_seguimiento || ''}
                    onChange={(e) => setSelectedPedido({ ...selectedPedido, codigo_seguimiento: e.target.value })}
                    placeholder="Ej. SH-9847120 / Clave: 4921"
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Notas Internas de Atención
                  </label>
                  <input
                    type="text"
                    value={selectedPedido.notas_internas || ''}
                    onChange={(e) => setSelectedPedido({ ...selectedPedido, notas_internas: e.target.value })}
                    placeholder="Comentarios del equipo..."
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Guardar Datos de Seguimiento
                </button>
              </div>
            </form>

            {/* Historial de Cambios de Estado */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-xs uppercase text-zinc-500">
                Historial de Trazabilidad
              </h4>
              <div className="space-y-1.5 text-xs text-zinc-600 max-h-40 overflow-y-auto pr-1">
                {historial.map((h, i) => (
                  <div key={i} className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-800 uppercase mr-2">{h.estado_nuevo}</span>
                      <span>{h.nota}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {new Date(h.created_at).toLocaleString('es-PE')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de Envío de Plantillas WhatsApp */}
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap gap-2 justify-end">
              <a
                href={getUrlWhatsAppPlantilla(selectedPedido, 'instrucciones_pago')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Enviar Datos Pago
              </a>

              <a
                href={getUrlWhatsAppPlantilla(selectedPedido, 'pago_confirmado')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Pago Confirmado
              </a>

              <a
                href={getUrlWhatsAppPlantilla(selectedPedido, 'en_camino')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" /> En Camino / Guía
              </a>

              <a
                href={getUrlWhatsAppPlantilla(selectedPedido, 'listo_recojo')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" /> Listo para Recojo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
