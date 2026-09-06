package backend.dto;

import java.time.LocalDateTime;

public class KardexDetalleDTO {
    private int numero;
    private LocalDateTime fecha;
    private String concepto; // 'Entrada', 'Salida', 'Reposicion', etc.
    private String documento; // Número de factura o pedido
    
    // Entradas
    private int cantEntrada;
    private double vrUnitarioEntrada;
    private double vrTotalEntrada;
    
    // Salidas
    private int cantSalida;
    private double vrUnitarioSalida;
    private double vrTotalSalida;
    
    // Saldos
    private int saldoCantidad;
    private double saldoVrUnitario;
    private double saldoTotal;

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
    public int getSaldoCantidad() { return saldoCantidad; }
    public void setSaldoCantidad(int saldoCantidad) { this.saldoCantidad = saldoCantidad; }
    public double getSaldoVrUnitario() { return saldoVrUnitario; }
    public void setSaldoVrUnitario(double saldoVrUnitario) { this.saldoVrUnitario = saldoVrUnitario; }
    public double getSaldoTotal() { return saldoTotal; }
    public void setSaldoTotal(double saldoTotal) { this.saldoTotal = saldoTotal; }
}