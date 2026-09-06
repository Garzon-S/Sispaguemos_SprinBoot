package backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "infantil")
public class Infantil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_infantil")
    private Integer idInfantil;

    @Column(name = "talla", nullable = false)
    private String talla;

    @Column(name = "edad_minima")
    private Integer edadMinima;

    @Column(name = "edad_maxima")
    private Integer edadMaxima;

    @Column(name = "pecho_cm")
    private Double pechoCm;

    @Column(name = "cintura_cm")
    private Double cinturaCm;

    @Column(name = "altura_cm")
    private Double alturaCm;


@Column(name = "cantidad_talla")
private Integer cantidadTalla;

    @Column(name = "fk_id_prenda", nullable = false)
    private Integer fkIdPrenda;

    // Getters y Setters
    public Integer getIdInfantil() { return idInfantil; }
    public void setIdInfantil(Integer idInfantil) { this.idInfantil = idInfantil; }

    public String getTalla() { return talla; }
    public void setTalla(String talla) { this.talla = talla; }

    public Integer getEdadMinima() { return edadMinima; }
    public void setEdadMinima(Integer edadMinima) { this.edadMinima = edadMinima; }

    public Integer getEdadMaxima() { return edadMaxima; }
    public void setEdadMaxima(Integer edadMaxima) { this.edadMaxima = edadMaxima; }

    public Double getPechoCm() { return pechoCm; }
    public void setPechoCm(Double pechoCm) { this.pechoCm = pechoCm; }

    public Double getCinturaCm() { return cinturaCm; }
    public void setCinturaCm(Double cinturaCm) { this.cinturaCm = cinturaCm; }

    public Double getAlturaCm() { return alturaCm; }
    public void setAlturaCm(Double alturaCm) { this.alturaCm = alturaCm; }

    public Integer getCantidadTalla() { return cantidadTalla; }
public void setCantidadTalla(Integer cantidadTalla) { this.cantidadTalla = cantidadTalla; }

    public Integer getFkIdPrenda() { return fkIdPrenda; }
    public void setFkIdPrenda(Integer fkIdPrenda) { this.fkIdPrenda = fkIdPrenda; }
}