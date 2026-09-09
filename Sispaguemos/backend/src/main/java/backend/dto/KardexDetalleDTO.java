package backend.dto;

import java.time.LocalDateTime;

public class KardexDetalleDTO {
    private int numero;
    private LocalDateTime fecha;
    private String concepto; 
    private String documento; 
    
    // Entradas
    private int cantEntrada;
    private double vrUnitarioEntrada;
    private double vrTotalEntrada;
    
    // Salidas
    private int cantSalida;
    private double vrUnitarioSalida;
    private double vrTotalSalida;
    
    // Existencia Inicial (Antes del movimiento)
    private int existenciaInicialCant;
    private double existenciaInicialVrUnit;
    private double existenciaInicialTotal;

    // Existencia Final (Despues del movimiento)
    private int existenciaFinalCant;
    private double existenciaFinalVrUnit;
    private double existenciaFinalTotal;

    // Getters y Setters
    public int getNumero() { return numero; }
    public void setNumero(int numero) { this.numero = numero; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getConcepto() { return concepto; }
    public void setConcepto(String concepto) { this.concepto = concepto; }
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public int getCantEntrada() { return cantEntrada; }
    public void setCantEntrada(int cantEntrada) { this.cantEntrada = cantEntrada; }
    public double getVrUnitarioEntrada() { return vrUnitarioEntrada; }
    public void setVrUnitarioEntrada(double vrUnitarioEntrada) { this.vrUnitarioEntrada = vrUnitarioEntrada; }
    public double getVrTotalEntrada() { return vrTotalEntrada; }
    public void setVrTotalEntrada(double vrTotalEntrada) { this.vrTotalEntrada = vrTotalEntrada; }
    public int getCantSalida() { return cantSalida; }
    public void setCantSalida(int cantSalida) { this.cantSalida = cantSalida; }
    public double getVrUnitarioSalida() { return vrUnitarioSalida; }
    public void setVrUnitarioSalida(double vrUnitarioSalida) { this.vrUnitarioSalida = vrUnitarioSalida; }
    public double getVrTotalSalida() { return vrTotalSalida; }
    public void setVrTotalSalida(double vrTotalSalida) { this.vrTotalSalida = vrTotalSalida; }

    public int getExistenciaInicialCant() { return existenciaInicialCant; }
    public void setExistenciaInicialCant(int existenciaInicialCant) { this.existenciaInicialCant = existenciaInicialCant; }
    public double getExistenciaInicialVrUnit() { return existenciaInicialVrUnit; }
    public void setExistenciaInicialVrUnit(double existenciaInicialVrUnit) { this.existenciaInicialVrUnit = existenciaInicialVrUnit; }
    public double getExistenciaInicialTotal() { return existenciaInicialTotal; }
    public void setExistenciaInicialTotal(double existenciaInicialTotal) { this.existenciaInicialTotal = existenciaInicialTotal; }

    public int getExistenciaFinalCant() { return existenciaFinalCant; }
    public void setExistenciaFinalCant(int existenciaFinalCant) { this.existenciaFinalCant = existenciaFinalCant; }
    public double getExistenciaFinalVrUnit() { return existenciaFinalVrUnit; }
    public void setExistenciaFinalVrUnit(double existenciaFinalVrUnit) { this.existenciaFinalVrUnit = existenciaFinalVrUnit; }
    public double getExistenciaFinalTotal() { return existenciaFinalTotal; }
    public void setExistenciaFinalTotal(double existenciaFinalTotal) { this.existenciaFinalTotal = existenciaFinalTotal; }
}