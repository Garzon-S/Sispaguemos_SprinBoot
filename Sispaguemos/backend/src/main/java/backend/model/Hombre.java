package backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "hombre")
public class Hombre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hombre")
    private Integer idHombre;

    @Column(name = "talla", nullable = false)
    private String talla;

    @Column(name = "pecho_cm")
    private Double pechoCm;

    @Column(name = "cintura_cm")
    private Double cinturaCm;

    @Column(name = "cadera_cm")
    private Double caderaCm;

    @Column(name = "largo_cm")
    private Double largoCm;

    @Column(name = "cantidad_talla")
    private Integer cantidadTalla;

    @Column(name = "fk_id_prenda", nullable = false)
    private Integer fkIdPrenda;

    // Getters y Setters
    public Integer getIdHombre() { return idHombre; }
    public void setIdHombre(Integer idHombre) { this.idHombre = idHombre; }

    public String getTalla() { return talla; }
    public void setTalla(String talla) { this.talla = talla; }

    public Double getPechoCm() { return pechoCm; }
    public void setPechoCm(Double pechoCm) { this.pechoCm = pechoCm; }

    public Double getCinturaCm() { return cinturaCm; }
    public void setCinturaCm(Double cinturaCm) { this.cinturaCm = cinturaCm; }

    public Double getCaderaCm() { return caderaCm; }
    public void setCaderaCm(Double caderaCm) { this.caderaCm = caderaCm; }

    public Double getLargoCm() { return largoCm; }
    public void setLargoCm(Double largoCm) { this.largoCm = largoCm; }

    public Integer getCantidadTalla() { return cantidadTalla; }
    public void setCantidadTalla(Integer cantidadTalla) { this.cantidadTalla = cantidadTalla; }

    public Integer getFkIdPrenda() { return fkIdPrenda; }
    public void setFkIdPrenda(Integer fkIdPrenda) { this.fkIdPrenda = fkIdPrenda; }
}