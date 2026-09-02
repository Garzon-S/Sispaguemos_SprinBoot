package backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarFacturaElectronica(Map<String, Object> datosFactura) throws MessagingException {
        String destinatario = (String) datosFactura.get("correo_destino");
        String idVenta = String.valueOf(datosFactura.get("idVenta"));
        String fecha = (String) datosFactura.get("fecha");
        String cajero = (String) datosFactura.get("cajero");
        String metodoPago = (String) datosFactura.get("metodoPago");
        Double total = Double.valueOf(datosFactura.get("total").toString());
        Double iva = Double.valueOf(datosFactura.get("iva").toString());
        Double subtotal = total - iva;

        List<Map<String, Object>> items = (List<Map<String, Object>>) datosFactura.get("items");

        StringBuilder htmlItems = new StringBuilder();
        if (items != null) {
            for (Map<String, Object> item : items) {
                String nombre = (String) item.get("nombre");
                int cantidad = Integer.parseInt(item.get("cantidad").toString());
                double precio = Double.parseDouble(item.get("precio").toString());
                double sub = precio * cantidad;

                htmlItems.append("<tr>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(nombre).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: center;'>").append(cantidad).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>$").append(String.format("%,.0f", precio)).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>$").append(String.format("%,.0f", sub)).append("</td>")
                        .append("</tr>");
            }
        }

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>" +
                "<h2 style='color: #e63982; text-align: center;'>PAGUE MENOS - SISPAGUEMOS</h2>" +
                "<p style='text-align: center; color: #666; font-size: 12px;'>NIT: 900.123.456-7 | Régimen Común</p>" +
                "<hr style='border: none; border-top: 1px solid #eee;'/>" +
                "<p><b>Factura No:</b> " + idVenta + "</p>" +
                "<p><b>Fecha:</b> " + fecha + "</p>" +
                "<p><b>Cajero:</b> " + cajero + "</p>" +
                "<p><b>Método de Pago:</b> " + metodoPago + "</p>" +
                "<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>" +
                "<thead><tr style='background-color: #f8f9fa; color: #333; text-align: left;'>" +
                "<th style='padding: 8px;'>Prenda</th><th style='padding: 8px; text-align: center;'>Cant</th><th style='padding: 8px; text-align: right;'>Vr. Unit</th><th style='padding: 8px; text-align: right;'>Subtotal</th>" +
                "</tr></thead><tbody>" +
                htmlItems.toString() +
                "</tbody></table>" +
                "<div style='margin-top: 20px; text-align: right; font-size: 14px;'>" +
                "<p>Subtotal (Base): <b>$" + String.format("%,.0f", subtotal) + "</b></p>" +
                "<p>IVA (19%): <b>$" + String.format("%,.0f", iva) + "</b></p>" +
                "<h3 style='color: #2b1830;'>Total Pagado: $" + String.format("%,.0f", total) + " COP</h3>" +
                "</div>" +
                "<hr style='border: none; border-top: 1px solid #eee; margin-top: 20px;'/>" +
                "<p style='text-align: center; font-size: 11px; color: #888;'>Resolución DIAN Autorización POS No. 18764032943<br>¡Gracias por su compra en Pague Menos!</p>" +
                "</div>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(destinatario);
        helper.setSubject("Factura Electrónica de Compra - Pague Menos (No. " + idVenta + ")");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}