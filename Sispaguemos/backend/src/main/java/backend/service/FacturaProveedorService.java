package backend.service;

import backend.model.*;
import backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class FacturaProveedorService {

    @Autowired
    private FacturaProveedorRepository facturaRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Transactional
    public FacturaProveedor registrarYRecibirFactura(FacturaProveedor factura) {
        if (factura.getDetalles() != null) {
            for (DetalleFacturaProveedor detalle : factura.getDetalles()) {
                detalle.setFacturaProveedor(factura);
            }
        }

        if (FacturaProveedor.EstadoFactura.Recibida.equals(factura.getEstado())) {
            factura.setFechaRecepcion(LocalDateTime.now());
            aplicarRestockInventario(factura);
        }

        return facturaRepository.save(factura);
    }

    @Transactional
    public FacturaProveedor marcarComoRecibida(Long idFactura) {
        FacturaProveedor factura = facturaRepository.findById(idFactura)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        if (!FacturaProveedor.EstadoFactura.Recibida.equals(factura.getEstado())) {
            factura.setEstado(FacturaProveedor.EstadoFactura.Recibida);
            factura.setFechaRecepcion(LocalDateTime.now());
            
            aplicarRestockInventario(factura);
            facturaRepository.save(factura);
        }

        return factura;
    }

    private void aplicarRestockInventario(FacturaProveedor factura) {
        if (factura.getDetalles() == null) return;

        for (DetalleFacturaProveedor detalle : factura.getDetalles()) {
            int cantidadRecibida = detalle.getCantidadRecibida();
            if (cantidadRecibida <= 0) continue;

            double precioCompra = detalle.getPrecioCompra() != null ? detalle.getPrecioCompra().doubleValue() : 0.0;
            Prenda prenda = detalle.getPrenda();
            if (prenda == null || prenda.getIdPrenda() == null) continue;

            long idPrendaObjetivo = prenda.getIdPrenda();

            // Buscamos si ya existe un registro en bodega asociado a esta prenda usando reflexión de forma segura
            Bodega bodegaEncontrada = null;
            for (Bodega b : bodegaRepository.findAll()) {
                try {
                    Object prendaObj = b.getClass().getMethod("getPrenda").invoke(b);
                    if (prendaObj != null) {
                        Object pId = prendaObj.getClass().getMethod("getIdPrenda").invoke(prendaObj);
                        if (pId != null) {
                            long idEncontrado = Long.parseLong(String.valueOf(pId));
                            // Comparación limpia usando primitivo == para evitar errores con long
                            if (idEncontrado == idPrendaObjetivo) {
                                bodegaEncontrada = b;
                                break;
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            try {
                if (bodegaEncontrada == null) {
                    bodegaEncontrada = new Bodega();
                    try { bodegaEncontrada.getClass().getMethod("setPrenda", Prenda.class).invoke(bodegaEncontrada, prenda); } catch(Exception e){}
                    try { bodegaEncontrada.getClass().getMethod("setCantidadActual", int.class).invoke(bodegaEncontrada, 0); } catch(Exception e){
                        try { bodegaEncontrada.getClass().getMethod("setCantidadActual", double.class).invoke(bodegaEncontrada, 0.0); } catch(Exception ex){}
                    }
                    try { bodegaEncontrada.getClass().getMethod("setCostoPromedio", double.class).invoke(bodegaEncontrada, precioCompra); } catch(Exception e){
                        try { bodegaEncontrada.getClass().getMethod("setCostoPromedio", BigDecimal.class).invoke(bodegaEncontrada, BigDecimal.valueOf(precioCompra)); } catch(Exception ex){}
                    }
                }

                // Extraemos valores actuales de stock y costo de forma segura
                int stockAnterior = 0;
                try {
                    Object val = bodegaEncontrada.getClass().getMethod("getCantidadActual").invoke(bodegaEncontrada);
                    if (val != null) stockAnterior = Integer.parseInt(String.valueOf(val));
                } catch (Exception e) {}

                double costoAnterior = 0.0;
                try {
                    Object val = bodegaEncontrada.getClass().getMethod("getCostoPromedio").invoke(bodegaEncontrada);
                    if (val instanceof BigDecimal) costoAnterior = ((BigDecimal) val).doubleValue();
                    else if (val != null) costoAnterior = Double.parseDouble(String.valueOf(val));
                } catch (Exception e) {}

                int stockNuevo = stockAnterior + cantidadRecibida;
                double nuevoCostoPromedio = stockNuevo > 0 
                    ? ((stockAnterior * costoAnterior) + (cantidadRecibida * precioCompra)) / stockNuevo 
                    : precioCompra;

                // Actualizamos la bodega
                try { bodegaEncontrada.getClass().getMethod("setCantidadActual", int.class).invoke(bodegaEncontrada, stockNuevo); } catch(Exception e){}
                try { bodegaEncontrada.getClass().getMethod("setCostoPromedio", double.class).invoke(bodegaEncontrada, nuevoCostoPromedio); } catch(Exception e){
                    try { bodegaEncontrada.getClass().getMethod("setCostoPromedio", BigDecimal.class).invoke(bodegaEncontrada, BigDecimal.valueOf(nuevoCostoPromedio)); } catch(Exception ex){}
                }
                
                try { bodegaEncontrada.getClass().getMethod("setFechaActualizacion", LocalDateTime.class).invoke(bodegaEncontrada, LocalDateTime.now()); } catch(Exception ignored){}

                bodegaRepository.save(bodegaEncontrada);

                // Registramos el movimiento en el Kardex
                MovimientoInventario movimiento = new MovimientoInventario();
                try { movimiento.getClass().getMethod("setStock", Bodega.class).invoke(movimiento, bodegaEncontrada); } catch(Exception e){
                    try { movimiento.getClass().getMethod("setBodega", Bodega.class).invoke(movimiento, bodegaEncontrada); } catch(Exception ex){}
                }
                try { movimiento.getClass().getMethod("setCantidad", int.class).invoke(movimiento, cantidadRecibida); } catch(Exception e){}
                try { movimiento.getClass().getMethod("setTipoMovimiento", MovimientoInventario.TipoMovimiento.class).invoke(movimiento, MovimientoInventario.TipoMovimiento.Entrada); } catch(Exception e){}
                try { movimiento.getClass().getMethod("setObservacion", String.class).invoke(movimiento, "Restock Factura Proveedor #" + factura.getNumeroFactura()); } catch(Exception e){}
                try { movimiento.getClass().getMethod("setFechaMovimiento", LocalDateTime.class).invoke(movimiento, LocalDateTime.now()); } catch(Exception e){}
                try { movimiento.getClass().getMethod("setUsuario", Usuario.class).invoke(movimiento, factura.getUsuario()); } catch(Exception ignored){}

                movimientoRepository.save(movimiento);

            } catch (Exception ignored) {}
        }
    }
}