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
        factura.setNumeroFactura("TEMP-" + System.nanoTime());
        if (factura.getDetalles() != null) {
            for (DetalleFacturaProveedor detalle : factura.getDetalles()) {
                detalle.setFacturaProveedor(factura);
            }
        }

        if (FacturaProveedor.EstadoFactura.Recibida.equals(factura.getEstado())
                || FacturaProveedor.EstadoFactura.Incompleta.equals(factura.getEstado())) {
            factura.setFechaRecepcion(LocalDateTime.now());
            aplicarRestockInventario(factura);
        }

        FacturaProveedor guardada = facturaRepository.saveAndFlush(factura);
        guardada.setNumeroFactura(String.format("FAC-%06d", guardada.getIdFacturaProveedor()));
        return facturaRepository.save(guardada);
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

            if (detalle.getPrenda() == null || detalle.getPrenda().getIdPrenda() == null) continue;

            BigDecimal precioCompra = detalle.getPrecioCompra() != null ? detalle.getPrecioCompra() : BigDecimal.ZERO;
            Integer idPrenda = detalle.getPrenda().getIdPrenda();

            Bodega bodegaEncontrada = bodegaRepository.findByIdPrenda(idPrenda);
            if (bodegaEncontrada == null) {
                bodegaEncontrada = new Bodega();
                bodegaEncontrada.setIdPrenda(idPrenda);
                bodegaEncontrada.setStockActual(0);
                bodegaEncontrada.setStockMinimo(5);
                bodegaEncontrada.setStockMaximo(85);
                bodegaEncontrada.setCostoPromedio(BigDecimal.ZERO);
            }

            int stockAnterior = bodegaEncontrada.getStockActual() != null ? bodegaEncontrada.getStockActual() : 0;
            BigDecimal costoAnterior = bodegaEncontrada.getCostoPromedio() != null ? bodegaEncontrada.getCostoPromedio() : BigDecimal.ZERO;
            int stockNuevo = stockAnterior + cantidadRecibida;
            BigDecimal costoPromedioNuevo = stockNuevo > 0
                    ? ((costoAnterior.multiply(BigDecimal.valueOf(stockAnterior)))
                        .add(precioCompra.multiply(BigDecimal.valueOf(cantidadRecibida))))
                        .divide(BigDecimal.valueOf(stockNuevo), 2, java.math.RoundingMode.HALF_UP)
                    : precioCompra;

            bodegaEncontrada.setStockActual(stockNuevo);
            bodegaEncontrada.setCostoPromedio(costoPromedioNuevo);
            bodegaEncontrada.setFechaActualizacion(LocalDateTime.now());
            Bodega bodegaGuardada = bodegaRepository.saveAndFlush(bodegaEncontrada);

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setTipoMovimiento(MovimientoInventario.TipoMovimiento.Entrada);
            movimiento.setCantidad(cantidadRecibida);
            movimiento.setFechaMovimiento(LocalDateTime.now());
            movimiento.setObservacion("Restock Factura Proveedor #" + factura.getNumeroFactura());
            movimiento.setFkIdStock(bodegaGuardada.getIdBodega());
            movimiento.setFkIdUsuario(factura.getUsuario() != null ? factura.getUsuario().getId() : null);
            movimientoRepository.save(movimiento);
        }
    }
}