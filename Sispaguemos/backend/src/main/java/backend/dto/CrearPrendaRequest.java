package backend.dto;

import backend.model.Hombre;
import backend.model.Mujer;
import backend.model.Infantil;
import java.math.BigDecimal;
import java.util.List;

public class CrearPrendaRequest {
    private String codigoBarras;
    private String nombrePrend;
    private String descripcionPrend;
    private String genero;
    private String color;
    private Double precioVenta;
    private Integer cantidadDisponibleVenta;
    private String estado;
    private String imagenPrend;

    // Campos de Bodega
    private Integer stockActual;
    private Integer stockMinimo;
    private Integer stockMaximo;
    private BigDecimal costoPromedio;

    // Tallas con cantidades por género
    private List<Hombre> tallasHombre;
    private List<Mujer> tallasMujer;
    private List<Infantil> tallasInfantil;

    // Getters y Setters Básicos
    public String getCodigoBarras() { return codigoBarras; }
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }

    public String getNombrePrend() { return nombrePrend; }
    public void setNombrePrend(String nombrePrend) { this.nombrePrend = nombrePrend; }

    public String getDescripcionPrend() { return descripcionPrend; }
    public void setDescripcionPrend(String descripcionPrend) { this.descripcionPrend = descripcionPrend; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(Double precioVenta) { this.precioVenta = precioVenta; }

    public Integer getCantidadDisponibleVenta() { return cantidadDisponibleVenta; }
    public void setCantidadDisponibleVenta(Integer cantidadDisponibleVenta) { this.cantidadDisponibleVenta = cantidadDisponibleVenta; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getImagenPrend() { return imagenPrend; }
    public void setImagenPrend(String imagenPrend) { this.imagenPrend = imagenPrend; }

    // Getters y Setters de Bodega
    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }

    public Integer getStockMaximo() { return stockMaximo; }
    public void setStockMaximo(Integer stockMaximo) { this.stockMaximo = stockMaximo; }

    public BigDecimal getCostoPromedio() { return costoPromedio; }
    public void setCostoPromedio(BigDecimal costoPromedio) { this.costoPromedio = costoPromedio; }

    // Getters y Setters de Tallas
    public List<Hombre> getTallasHombre() { return tallasHombre; }
    public void setTallasHombre(List<Hombre> tallasHombre) { this.tallasHombre = tallasHombre; }

    public List<Mujer> getTallasMujer() { return tallasMujer; }
    public void setTallasMujer(List<Mujer> tallasMujer) { this.tallasMujer = tallasMujer; }

    public List<Infantil> getTallasInfantil() { return tallasInfantil; }
    public void setTallasInfantil(List<Infantil> tallasInfantil) { this.tallasInfantil = tallasInfantil; }
}