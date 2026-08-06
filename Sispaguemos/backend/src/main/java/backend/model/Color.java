package backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Color")
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_color")
    private Long idColor;

    @Column(name = "nom_color", nullable = false)
    private String nomColor;

    // Getters y Setters
    public Long getIdColor() { return idColor; }
    public void setIdColor(Long idColor) { this.idColor = idColor; }

    public String getNomColor() { return nomColor; }
    public void setNomColor(String nomColor) { this.nomColor = nomColor; }
}