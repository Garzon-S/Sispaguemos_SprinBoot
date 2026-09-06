package backend.service;

import backend.dto.KardexDetalleDTO;
import backend.model.Bodega;
import backend.model.MovimientoInventario;
import backend.repository.BodegaRepository;
import backend.repository.MovimientoInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class KardexService {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    public List<KardexDetalleDTO> obtenerReporteKardexPorPrenda(Long idPrenda) {
        List<MovimientoInventario> movimientos = movimientoRepository.findAll();

        // 1. ORDENAR CRONOLÓGICAMENTE LOS MOVIMIENTOS
        movimientos.sort((m1, m2) -> {
            if (m1.getFechaMovimiento() != null && m2.getFechaMovimiento() != null) {
                int comparacionFechas = m1.getFechaMovimiento().compareTo(m2.getFechaMovimiento());
                if (comparacionFechas != 0) return comparacionFechas;
            }
            if (m1.getIdMovimiento() != null && m2.getIdMovimiento() != null) {
                return m1.getIdMovimiento().compareTo(m2.getIdMovimiento());
            }
            return 0;
        });

        List<Bodega> bodegas = bodegaRepository.findAll();
        List<KardexDetalleDTO> kardexDetalles = new ArrayList<>();

        // 2. Identificamos los IDs de bodega/stock válidos para esta prenda
        List<Long> idsBodegaValidos = new ArrayList<>();
        double costoPromedioPrenda = 30000.0;

        for (Bodega b : bodegas) {
            try {
                Long prendaIdAsociada = null;
                
                try {
                    Object pId = b.getClass().getMethod("getIdPrenda").invoke(b);
                    if (pId != null) prendaIdAsociada = Long.parseLong(String.valueOf(pId));
                } catch (Exception e1) {
                    try {
                        Object prendaObj = b.getClass().getMethod("getPrenda").invoke(b);
                        if (prendaObj != null) {
                            Object pId = prendaObj.getClass().getMethod("getIdPrenda").invoke(prendaObj);
                            if (pId != null) prendaIdAsociada = Long.parseLong(String.valueOf(pId));
                        }
                    } catch (Exception ignored) {}
                }

                if (prendaIdAsociada != null && prendaIdAsociada.longValue() == idPrenda.longValue()) {
                    Long idStockVal = extraerIdFlexible(b);
                    if (idStockVal != null) {
                        idsBodegaValidos.add(idStockVal);
                    }

                    try {
                        Object costoObj = b.getClass().getMethod("getCostoPromedio").invoke(b);
                        if (costoObj instanceof BigDecimal) {
                            costoPromedioPrenda = ((BigDecimal) costoObj).doubleValue();
                        } else if (costoObj != null) {
                            costoPromedioPrenda = Double.parseDouble(String.valueOf(costoObj));
                        }
                    } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        }

        int saldoCantidadAcumulada = 0;
        double saldoTotalAcumulado = 0.0;
        int contador = 1;

        // 3. Procesamos los movimientos ordenados
        for (MovimientoInventario mov : movimientos) {
            boolean perteneceAPrenda = false;

            try {
                Object relObj = null;
                try { relObj = mov.getClass().getMethod("getStock").invoke(mov); } catch (Exception e) {}
                if (relObj == null) {
                    try { relObj = mov.getClass().getMethod("getBodega").invoke(mov); } catch (Exception e) {}
                }

                if (relObj != null) {
                    Long relId = extraerIdFlexible(relObj);
                    if (relId != null && idsBodegaValidos.contains(relId)) {
                        perteneceAPrenda = true;
                    }
                }

                if (!perteneceAPrenda) {
                    Long movStockId = extraerIdFlexibleDirecto(mov, "getStockId", "getIdStock", "getFkIdStock", "getIdBodega");
                    if (movStockId != null && idsBodegaValidos.contains(movStockId)) {
                        perteneceAPrenda = true;
                    }
                }
            } catch (Exception ignored) {}

            if (idsBodegaValidos.isEmpty()) {
                continue;
            }

            if (perteneceAPrenda) {
                KardexDetalleDTO detalle = new KardexDetalleDTO();
                detalle.setNumero(contador++);
                detalle.setFecha(mov.getFechaMovimiento());
                
                String tipoMov = mov.getTipoMovimiento() != null ? mov.getTipoMovimiento().toString() : "Entrada";
                detalle.setConcepto(tipoMov);
                detalle.setDocumento(mov.getObservacion() != null ? mov.getObservacion() : "REF-" + mov.getIdMovimiento());

                int cantidad = mov.getCantidad() != null ? Math.abs(mov.getCantidad()) : 0;

                if ("Entrada".equalsIgnoreCase(tipoMov) || "ENTRADA".equalsIgnoreCase(tipoMov)) {
                    detalle.setCantEntrada(cantidad);
                    detalle.setVrUnitarioEntrada(costoPromedioPrenda);
                    detalle.setVrTotalEntrada(cantidad * costoPromedioPrenda);

                    detalle.setCantSalida(0);
                    detalle.setVrUnitarioSalida(0.0);
                    detalle.setVrTotalSalida(0.0);

                    saldoCantidadAcumulada += cantidad;
                    saldoTotalAcumulado += detalle.getVrTotalEntrada();
                } else {
                    detalle.setCantEntrada(0);
                    detalle.setVrUnitarioEntrada(0.0);
                    detalle.setVrTotalEntrada(0.0);

                    detalle.setCantSalida(cantidad);

                    double costoUnitarioSalida = (saldoCantidadAcumulada > 0) 
                        ? (saldoTotalAcumulado / saldoCantidadAcumulada) 
                        : costoPromedioPrenda;

                    detalle.setVrUnitarioSalida(costoUnitarioSalida);
                    double valorTotalSalida = cantidad * costoUnitarioSalida;
                    detalle.setVrTotalSalida(valorTotalSalida);

                    // Permite restar libremente, incluso si cae en negativo
                    saldoCantidadAcumulada -= cantidad;
                    saldoTotalAcumulado -= valorTotalSalida;
                }

                detalle.setSaldoCantidad(saldoCantidadAcumulada);
                double saldoUnitarioFinal = saldoCantidadAcumulada != 0 ? (saldoTotalAcumulado / saldoCantidadAcumulada) : costoPromedioPrenda;
                detalle.setSaldoVrUnitario(Math.abs(saldoUnitarioFinal));
                detalle.setSaldoTotal(saldoTotalAcumulado); // Permite negativos directos

                kardexDetalles.add(detalle);
            }
        }

        return kardexDetalles;
    }

    private Long extraerIdFlexible(Object obj) {
        String[] metodos = {"getIdStock", "getIdBodega", "getId", "getIdPrenda"};
        for (String m : metodos) {
            try {
                Object val = obj.getClass().getMethod(m).invoke(obj);
                if (val != null) return Long.parseLong(String.valueOf(val));
            } catch (Exception ignored) {}
        }
        return null;
    }

    private Long extraerIdFlexibleDirecto(Object obj, String... metodos) {
        for (String m : metodos) {
            try {
                Object val = obj.getClass().getMethod(m).invoke(obj);
                if (val != null) return Long.parseLong(String.valueOf(val));
            } catch (Exception ignored) {}
        }
        return null;
    }
}