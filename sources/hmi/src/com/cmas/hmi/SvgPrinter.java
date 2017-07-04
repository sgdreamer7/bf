/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.RescaleOp;
import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JComponent;
import org.apache.batik.swing.JSVGCanvas;

/**
 *
 * @author Admin
 */
public class SvgPrinter {

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

    public static void saveAsPDF2(String filename, JComponent canvas) {
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

            saveChartAsPDF(file, mapper, canvas);

        } catch (IOException ex) {
            Logger.getLogger(SvgPrinter.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private static void saveChartAsPDF(File file, FontMapper mapper, JComponent canvas) throws IOException {
        OutputStream out = new BufferedOutputStream(new FileOutputStream(file));
        writeChartAsPDF(out, mapper, canvas);
        out.close();
    }

    private static void writeChartAsPDF(OutputStream out, FontMapper mapper, JComponent canvas) throws IOException {
        float hMarging;
        float vMarging;
        float pctHMarging = (float) 0.0;
        float pctVMarging = (float) 0.0;
        float scaleFactor = (float) 1.0;

        Rectangle pagesize = new Rectangle((float) (canvas.getHeight() * scaleFactor), (float) (canvas.getWidth() * scaleFactor));
        hMarging = (float) (pagesize.getWidth() * pctHMarging);
        vMarging = (float) (pagesize.getHeight() * pctVMarging);

        Rectangle p = new Rectangle(0, 0, pagesize.getHeight(), pagesize.getWidth());
        Document document = new Document(p, hMarging, hMarging, vMarging, vMarging);
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.addAuthor("CMAS");
            document.open();
            PdfContentByte cb = writer.getDirectContent();
            PdfTemplate tp = cb.createTemplate(pagesize.getHeight(), pagesize.getWidth());
            Graphics2D g2 = tp.createGraphics(pagesize.getHeight() - vMarging * 2, pagesize.getWidth() - hMarging * 2, mapper);
            g2.scale(scaleFactor, scaleFactor);
            canvas.paintAll(g2);
            g2.dispose();
            cb.addTemplate(tp, vMarging, hMarging);
        } catch (DocumentException de) {
            System.err.println(de.getMessage());
        }
        document.close();
    }
}
