package backend.controller;

import backend.dto.KardexDetalleDTO;
import backend.service.KardexService;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.List;

@RestController
@RequestMapping("/api/kardex")
@CrossOrigin(origins = "*")
public class KardexController {

    @Autowired
    private KardexService kardexService;

    @GetMapping("/prenda/{idPrenda}")
    public ResponseEntity<List<KardexDetalleDTO>> obtenerKardexPrenda(@PathVariable Long idPrenda) {
        try {
            List<KardexDetalleDTO> reporte = kardexService.obtenerReporteKardexPorPrenda(idPrenda);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            e.printStackTrace(); // <-- TEMPORAL: para ver la causa real en la consola del backend
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/prenda/{idPrenda}/pdf")
    public ResponseEntity<byte[]> exportarKardexPdf(@PathVariable Long idPrenda) {
        try {
            List<KardexDetalleDTO> kardex = kardexService.obtenerReporteKardexPorPrenda(idPrenda);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            document.add(new Paragraph("Tarjeta de Kardex - Control de Existencias", fontTitulo));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(10);
            table.setWidthPercentage(100);
            
            String[] headers = {"No.", "Fecha", "Concepto", "Doc", "Ent. Cant", "Sal. Cant", "Ex. Inicial Cant", "Ex. Inicial V.T", "Ex. Final Cant", "Ex. Final V.T"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            for (KardexDetalleDTO m : kardex) {
                table.addCell(String.valueOf(m.getNumero()));
                table.addCell(m.getFecha() != null ? m.getFecha().toLocalDate().toString() : "");
                table.addCell(m.getConcepto() != null ? m.getConcepto() : "");
                table.addCell(m.getDocumento() != null ? m.getDocumento() : "");
                table.addCell(String.valueOf(m.getCantEntrada()));
                table.addCell(String.valueOf(m.getCantSalida()));
                table.addCell(String.valueOf(m.getExistenciaInicialCant()));
                table.addCell(String.valueOf(m.getExistenciaInicialTotal()));
                table.addCell(String.valueOf(m.getExistenciaFinalCant()));
                table.addCell(String.valueOf(m.getExistenciaFinalTotal()));
            }

            document.add(table);
            document.close();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("attachment", "kardex_prenda_" + idPrenda + ".pdf");

            return ResponseEntity.ok().headers(headersHttp).body(baos.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}