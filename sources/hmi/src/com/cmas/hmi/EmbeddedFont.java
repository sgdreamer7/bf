/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.awt.Font;
import java.awt.FontFormatException;
import java.io.IOException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author vns
 */
public class EmbeddedFont {

    private static HashMap<String, Font> fontMap;


    static {
        fontMap = new HashMap<String, Font>();
//        fontMap.put("FreeSans.ttf", createFont("FreeSans.ttf"));
//        fontMap.put("FreeSansBold.ttf", createFont("FreeSansBold.ttf"));
//        fontMap.put("tahoma.ttf", createFont("FreeSans.ttf"));
//        fontMap.put("tahomabd.ttf",  createFont("FreeSansBold.ttf"));
    }

    public static Font getFont(String fontFilename, float fontSize) {

        return createFont(fontFilename).deriveFont((float) fontSize);
    }

    public static String getFontPath(String fontFilename) {
        String filename = fontFilename;
        return EmbeddedFont.class.getResource("resources/fonts/" + filename).toExternalForm().replace("\\\\", "/");
    }

    private static Font createFont(String fontFilename) {

        try {
            String filename = fontFilename;
            Font mappedFont = fontMap.get(filename);
            if (mappedFont != null) {
                return mappedFont;
            } else {
                mappedFont = Font.createFont(Font.TRUETYPE_FONT, EmbeddedFont.class.getResourceAsStream("resources/fonts/" + filename));
                fontMap.put(filename, mappedFont);
                return mappedFont;
            }
        } catch (FontFormatException ex) {
            Logger.getLogger(EmbeddedFont.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(EmbeddedFont.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
