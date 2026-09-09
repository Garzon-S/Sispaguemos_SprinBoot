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

        // 1. Ordenar cronológicamente del más antiguo al más reciente
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
        List<Long> idsBodegaValidos = new ArrayList<>();
        double costoPromedioPrenda = 30000.0;
        int stockActualBodega = 0;

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
                        Object stockObj = b.getClass().getMethod("getCantidadStock").invoke(b);
                        if (stockObj == null) stockObj = b.getClass().getMethod("getStock").invoke(b);
                        if (stockObj != null) stockActualBodega = Integer.parseInt(String.valueOf(stockObj));
                    } catch (Exception ignored) {}

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

        // Filtrar solo los movimientos que pertenecen a esta prenda
        List<MovimientoInventario> movimientosPrenda = new ArrayList<>();
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

            if (perteneceAPrenda) {
                movimientosPrenda.add(mov);
            }
        }

        if (idsBodegaValidos.isEmpty()) {
            return kardexDetalles;
        }

        // ==========================================================
        // Calcular la existencia real ANTES del primer movimiento,
        // sin necesitar columnas nuevas en la BD.
        //
        // stockActualBodega = cantidad_actual en la tabla stock, que
        // ya refleja el resultado DESPUÉS de aplicar todos los
        // movimientos de esta lista. Para saber cuánto había antes,
        // recorremos los movimientos en reversa deshaciéndolos:
        //   - si fue Entrada, se resta esa cantidad
        //   - si fue Salida,  se suma esa cantidad
        // ==========================================================
        int stockInicialCalculado = stockActualBodega;
        for (int i = movimientosPrenda.size() - 1; i >= 0; i--) {
            MovimientoInventario mov = movimientosPrenda.get(i);
            String tipoMovRev = mov.getTipoMovimiento() != null ? mov.getTipoMovimiento().toString() : "Entrada";
            int cantidadRev = mov.getCantidad() != null ? Math.abs(mov.getCantidad()) : 0;

            if ("Entrada".equalsIgnoreCase(tipoMovRev) || "ENTRADA".equalsIgnoreCase(tipoMovRev)) {
                stockInicialCalculado -= cantidadRev;
            } else {
                stockInicialCalculado += cantidadRev;
            }
        }

        // Salvaguarda: si por datos inconsistentes diera negativo,
        // no propagamos el negativo a toda la tabla.
        if (stockInicialCalculado < 0) {
            stockInicialCalculado = 0;
        }

        int stockAcumulado = stockInicialCalculado;
        double totalAcumulado = stockAcumulado * costoPromedioPrenda;

        int contador = 1;
        // ==========================================================
        // FIN cálculo
        // ==========================================================

        for (MovimientoInventario mov : movimientosPrenda) {
            KardexDetalleDTO detalle = new KardexDetalleDTO();
            detalle.setNumero(contador++);
            detalle.setFecha(mov.getFechaMovimiento());

            String tipoMov = mov.getTipoMovimiento() != null ? mov.getTipoMovimiento().toString() : "Entrada";
            detalle.setConcepto(tipoMov);
            detalle.setDocumento(mov.getObservacion() != null ? mov.getObservacion() : "REF-" + mov.getIdMovimiento());

            int cantidad = mov.getCantidad() != null ? Math.abs(mov.getCantidad()) : 0;

            // 1. EXISTENCIA INICIAL: Lo que había antes de este movimiento específico
            int existenciaInicial = stockAcumulado;
            detalle.setExistenciaInicialCant(existenciaInicial);
            double initUnit = existenciaInicial != 0 ? (totalAcumulado / existenciaInicial) : costoPromedioPrenda;
            detalle.setExistenciaInicialVrUnit(Math.abs(initUnit));
            detalle.setExistenciaInicialTotal(totalAcumulado);

            // 2. PROCESAR MOVIMIENTO
            if ("Entrada".equalsIgnoreCase(tipoMov) || "ENTRADA".equalsIgnoreCase(tipoMov)) {
                detalle.setCantEntrada(cantidad);
                detalle.setVrUnitarioEntrada(costoPromedioPrenda);
                double vrEntTotal = cantidad * costoPromedioPrenda;
                detalle.setVrTotalEntrada(vrEntTotal);

                detalle.setCantSalida(0);
                detalle.setVrUnitarioSalida(0.0);
                detalle.setVrTotalSalida(0.0);

                stockAcumulado += cantidad;
                totalAcumulado += vrEntTotal;
            } else {
                detalle.setCantEntrada(0);
                detalle.setVrUnitarioEntrada(0.0);
                detalle.setVrTotalEntrada(0.0);

                // Salvaguarda: no dejar que una salida deje el stock negativo
                int cantidadSalidaReal = Math.min(cantidad, stockAcumulado);

                detalle.setCantSalida(cantidadSalidaReal);
                double costoUnitarioSalida = (stockAcumulado > 0) ? (totalAcumulado / stockAcumulado) : costoPromedioPrenda;
                detalle.setVrUnitarioSalida(costoUnitarioSalida);
                double vrSalTotal = cantidadSalidaReal * costoUnitarioSalida;
                detalle.setVrTotalSalida(vrSalTotal);

                stockAcumulado -= cantidadSalidaReal;
                totalAcumulado -= vrSalTotal;
            }

            // 3. EXISTENCIA FINAL: Lo que queda después de este movimiento
            detalle.setExistenciaFinalCant(stockAcumulado);
            double finalUnit = stockAcumulado != 0 ? (totalAcumulado / stockAcumulado) : costoPromedioPrenda;
            detalle.setExistenciaFinalVrUnit(Math.abs(finalUnit));
            detalle.setExistenciaFinalTotal(totalAcumulado);

            kardexDetalles.add(detalle);
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