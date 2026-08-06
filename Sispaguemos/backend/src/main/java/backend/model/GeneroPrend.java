package backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "genero_prend")
public class GeneroPrend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_genero_prend")
    private Long idGeneroPrend;

    @Column(name = "tipo_genero", nullable = false)
    private String tipoGenero;

    @Column(name = "estado_genero", nullable = false)
    private Integer estadoGenero;

    // Getters y Setters
    public Long getIdGeneroPrend() { return idGeneroPrend; }
    public void setIdGeneroPrend(Long idGeneroPrend) { this.idGeneroPrend = idGeneroPrend; }

    public String getTipoGenero() { return tipoGenero; }
    public void setTipoGenero(String tipoGenero) { this.tipoGenero = tipoGenero; }

    public Integer getEstadoGenero() { return estadoGenero; }
    public void setEstadoGenero(Integer estadoGenero) { this.estadoGenero = estadoGenero; }
}