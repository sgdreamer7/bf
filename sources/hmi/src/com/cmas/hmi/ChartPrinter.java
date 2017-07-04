/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jfree.chart.JFreeChart;

/**
 *
 * @author Admin
 */
public class ChartPrinter {

    private static int insertFile(DefaultFontMapper mapper, String filename, String fontName, String encoding) {
        try {
            Object allNames[] = BaseFont.getAllFontNames(filename, encoding, null);
            mapper.insertNames(allNames, filename);
        } catch (Exception e) {
        }
        DefaultFontMapper.BaseFontParameters pp = mapper.getBaseFontParameters(fontName);
        if (pp != null) {
            pp.encoding = encoding;
            pp.embedded = true;
            pp.cached = true;
        }
        return 1;
    }

    public static void saveAsPDF2(String filename, Rectangle pagesize, JFreeChart chart, StringBuffer eventsText) {
        try {
            File file = new File(filename);
            DefaultFontMapper mapper = new DefaultFontMapper();
            String path = EmbeddedFont.getFontPath("tahoma.ttf").toString();
            insertFile(mapper, path, "Tahoma", "Cp1251");
            path = EmbeddedFont.getFontPath("tahomabd.ttf").toString();
            insertFile(mapper, path, "Tahoma Bold", "Cp1251");
            path = EmbeddedFont.getFontPath("smbls.ttf").toString();
            insertFile(mapper, path, "Arial Unicode MS", BaseFont.IDENTITY_H);
            path = EmbeddedFont.getFontPath("FreeMono.ttf").toString();
            insertFile(mapper, path, "Free Mono", "Cp1251");
            path = EmbeddedFont.getFontPath("FreeMonoBold.ttf").toString();
            insertFile(mapper, path, "Free Mono Bold", "Cp1251");
            path = EmbeddedFont.getFontPath("FreeSans.ttf").toString();
            insertFile(mapper, path, "Free Sans", "Cp1251");
            path = EmbeddedFont.getFontPath("FreeSansBold.ttf").toString();
            insertFile(mapper, path, "Free Sans Bold", "Cp1251");

            saveChartAsPDF(file, pagesize, mapper, chart, eventsText);

        } catch (IOException ex) {
            Logger.getLogger(ChartPrinter.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private static void saveChartAsPDF(File file, Rectangle pagesize, FontMapper mapper, JFreeChart chart, StringBuffer eventsText) throws IOException {
        OutputStream out = new BufferedOutputStream(new FileOutputStream(file));
        writeChartAsPDF(out, pagesize, mapper, chart, eventsText);
        out.close();
    }

    private static void writeChartAsPDF(OutputStream out, Rectangle pagesize, FontMapper mapper, JFreeChart chart, StringBuffer eventsText) throws IOException {
        float hMarging;
        float vMarging;
        float pctHMarging = (float) 0.02;
        float pctVMarging = (float) 0.01;

        hMarging = (float) (pagesize.getWidth() * pctHMarging);
        vMarging = (float) (pagesize.getHeight() * pctVMarging);

        Rectangle p = new Rectangle(0, 0, pagesize.getHeight(), pagesize.getWidth());
        Document document = new Document(p, hMarging, hMarging, vMarging, vMarging);
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.addAuthor("CMAS");
            document.addSubject(chart.getTitle().getText());
            document.addTitle(chart.getTitle().getText());
            document.open();
            PdfContentByte cb = writer.getDirectContent();
            PdfTemplate tp = cb.createTemplate(pagesize.getHeight(), pagesize.getWidth());
            Graphics2D g2 = tp.createGraphics(pagesize.getHeight() - vMarging * 2, pagesize.getWidth() - hMarging * 2, mapper);
            Rectangle2D r2D = new Rectangle2D.Double(0, 0, pagesize.getHeight() - vMarging * 2, pagesize.getWidth() - hMarging * 2);
            chart.draw(g2, r2D);
            g2.dispose();
            cb.addTemplate(tp, vMarging, hMarging);
            if (eventsText.toString().equals("") == false) {
                document.newPage();
                Table table = new Table(9);
                table.setBorderWidth(1);
                table.setBorderColor(new Color(0, 0, 0));
                table.setPadding(1);
                table.setSpacing(0);
                table.endHeaders();
                String[] lines = eventsText.toString().split("\n");
                Font fnt = new Font(mapper.awtToPdf(EmbeddedFont.getFont("tahoma.ttf", 8)), 8, Font.NORMAL);
                for (int i = 0; i < lines.length - 1; i++) {
                    String[] cells = lines[i].split("\\u007C");
                    if (cells.length == 9) {
                        for (int j = 0; j < 9; j++) {

                            Phrase phr = new Phrase(cells[j], fnt);
                            Cell cell = new Cell(phr);
                            cell.setVerticalAlignment(Cell.ALIGN_MIDDLE);
                            table.addCell(cell);
                        }
                    }
                }
                float[] widths = {40, 100, 40, 100, 150, 600, 100, 100, 100};
                table.setWidths(widths);
                table.setWidth(100);
                document.add(table);
            }
        } catch (DocumentException de) {
            System.err.println(de.getMessage());
        }
        document.close();
    }
}
