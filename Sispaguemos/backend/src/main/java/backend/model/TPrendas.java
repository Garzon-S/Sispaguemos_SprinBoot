package backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "t_prendas")
public class TPrendas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idt_prendas")
    private Long idtPrendas;

    @Column(name = "talla_prend", nullable = false)
    private String tallaPrend;

    // Getters y Setters
    public Long getIdtPrendas() { return idtPrendas; }
    public void setIdtPrendas(Long idtPrendas) { this.idtPrendas = idtPrendas; }

    public String getTallaPrend() { return tallaPrend; }
    public void setTallaPrend(String tallaPrend) { this.tallaPrend = tallaPrend; }
}