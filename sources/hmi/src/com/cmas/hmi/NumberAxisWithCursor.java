/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Label;
import java.awt.geom.GeneralPath;
import java.awt.geom.Rectangle2D;
import java.text.NumberFormat;
import org.jfree.chart.axis.AxisState;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.axis.NumberTick;
import org.jfree.chart.axis.ValueTick;
import org.jfree.chart.event.AxisChangeEvent;
import org.jfree.chart.plot.PlotRenderingInfo;
import org.jfree.text.TextUtilities;
import org.jfree.ui.RectangleEdge;
import org.jfree.ui.TextAnchor;

/**
 *
 * @author vns
 */
public class NumberAxisWithCursor extends NumberAxis {

    private double cursorValue=0.0;

    public NumberAxisWithCursor(String label) {
        super(label);
    }

    public NumberAxisWithCursor() {
        super();
    }

    @Override
    public AxisState draw(Graphics2D g2, double cursor, Rectangle2D plotArea,
                Rectangle2D dataArea, RectangleEdge edge,
                PlotRenderingInfo plotState) {

        AxisState axisState=super.draw(g2, cursor, plotArea, dataArea, edge, plotState);


        if (isVisible()) {
            if (getRange().contains(cursorValue)) {
                double size=8;
                double delta=size/2;
                GeneralPath cursorShape = null;

                cursorShape=new GeneralPath();

                if (edge == RectangleEdge.TOP) {
                    double xPos=valueToJava2D(cursorValue, dataArea, edge);
                    cursorShape.moveTo(cursor-delta,xPos-delta);
                    cursorShape.lineTo(cursor+delta,xPos+delta);
                    cursorShape.lineTo(cursor-delta,xPos+delta);
                    cursorShape.lineTo(cursor+delta,xPos-delta);
                    cursorShape.lineTo(cursor-delta,xPos-delta);
                } else if (edge == RectangleEdge.BOTTOM) {
                    double xPos=valueToJava2D(cursorValue, dataArea, edge);
                    cursorShape.moveTo(cursor-delta,xPos-delta);
                    cursorShape.lineTo(cursor+delta,xPos+delta);
                    cursorShape.lineTo(cursor-delta,xPos+delta);
                    cursorShape.lineTo(cursor+delta,xPos-delta);
                    cursorShape.lineTo(cursor-delta,xPos-delta);
                } else if (edge == RectangleEdge.LEFT) {
                    double yPos=valueToJava2D(cursorValue, dataArea, edge);
                    cursorShape.moveTo(cursor-delta,yPos-delta);
                    cursorShape.lineTo(cursor+delta,yPos+delta);
                    cursorShape.lineTo(cursor+delta,yPos-delta);
                    cursorShape.lineTo(cursor-delta,yPos+delta);
                    cursorShape.lineTo(cursor-delta,yPos-delta);
                } else if (edge == RectangleEdge.RIGHT) {
                    double yPos=valueToJava2D(cursorValue, dataArea, edge);
                    cursorShape.moveTo(cursor-delta,yPos-delta);
                    cursorShape.lineTo(cursor+delta,yPos+delta);
                    cursorShape.lineTo(cursor+delta,yPos-delta);
                    cursorShape.lineTo(cursor-delta,yPos+delta);
                    cursorShape.lineTo(cursor-delta,yPos-delta);
                }
                cursorShape.closePath();
                Color clr=(Color)getTickLabelPaint();
                g2.setColor(clr);
                g2.setPaint(clr);
                g2.fill(cursorShape);


                if (RectangleEdge.isTopOrBottom(edge)) {
                    drawCursorValueHorizontal(g2,cursor, dataArea, edge);
                }
                else if (RectangleEdge.isLeftOrRight(edge)) {
                    drawCursorValueVertical(g2,cursor, dataArea, edge);
                }
            }
        }
        return axisState;
    }

    public Double getCursorValue() {
        return cursorValue;
    }

    public void setCursorValue(Double cursorValue) {
        setCursorValue(cursorValue,true);
    }

    public void setCursorValue(Double cursorValue,boolean notify) {
        this.cursorValue = cursorValue;
        if (notify) {
            notifyListeners(new AxisChangeEvent(this));
        }
    }


    protected void drawCursorValueHorizontal(Graphics2D g2, double cursor,
            Rectangle2D dataArea, RectangleEdge edge) {

        double currentTickValue = cursorValue;
        String tickLabel;
        NumberFormat formatter = getNumberFormatOverride();
        if (formatter != null) {
            tickLabel = formatter.format(currentTickValue);
        }
        else {
            tickLabel = getTickUnit().valueToString(currentTickValue);
        }
        TextAnchor anchor = null;
        TextAnchor rotationAnchor = null;
        double angle = 0.0;
        if (isVerticalTickLabels()) {
            anchor = TextAnchor.CENTER_RIGHT;
            rotationAnchor = TextAnchor.CENTER_RIGHT;
            if (edge == RectangleEdge.TOP) {
                angle = Math.PI / 2.0;
            }
            else {
                angle = -Math.PI / 2.0;
            }
        }
        else {
            if (edge == RectangleEdge.TOP) {
                anchor = TextAnchor.BOTTOM_CENTER;
                rotationAnchor = TextAnchor.BOTTOM_CENTER;
            }
            else {
                anchor = TextAnchor.TOP_CENTER;
                rotationAnchor = TextAnchor.TOP_CENTER;
            }
        }

        ValueTick tick = new NumberTick(new Double(currentTickValue),
                tickLabel, anchor, rotationAnchor, angle);
        Font font=getTickLabelFont().deriveFont(Font.BOLD,(float)(getTickLabelFont().getSize()*1.1));
        g2.setFont(font);
        Color clr=(Color) getTickLabelPaint();
        g2.setBackground(clr);
        g2.setColor(Color.WHITE);
        g2.setPaint(Color.WHITE);
        float[] anchorPoint = calculateAnchorPoint(tick, cursor,
                dataArea, edge);
        int x=0,y=0,w=0,h=0;
        Label l = new Label(tick.getText());
        x=(int)anchorPoint[0];
        y=(int)anchorPoint[1];
        w=l.getFontMetrics(font).stringWidth(tick.getText());
        h=l.getFontMetrics(font).getHeight()-2;
        if (isVerticalTickLabels()) {
            if (edge == RectangleEdge.LEFT) {
                x=x-w/2;
                y=y-h;
            }
        } else {
            if (edge == RectangleEdge.LEFT) {
                x=x-w;
                y=y-h/2;
            } else {
                y=y-h/2;
            }
        }

        g2.clearRect(x,y,w,h);
        g2.setColor(Color.WHITE);
        g2.setPaint(Color.WHITE);
        TextUtilities.drawRotatedString(tick.getText(), g2,
                anchorPoint[0], anchorPoint[1], tick.getTextAnchor(),
                tick.getAngle(), tick.getRotationAnchor());
        return;
    }

    /**
     * Calculates the positions of the tick labels for the axis, storing the
     * results in the tick label list (ready for drawing).
     *
     * @param g2  the graphics device.
     * @param dataArea  the area in which the plot should be drawn.
     * @param edge  the location of the axis.
     *
     * @return A list of ticks.
     */
    protected void drawCursorValueVertical(Graphics2D g2,double cursor,
            Rectangle2D dataArea, RectangleEdge edge) {

        double currentTickValue = cursorValue;
        String tickLabel;
        NumberFormat formatter = getNumberFormatOverride();
        if (formatter != null) {
            tickLabel = formatter.format(currentTickValue);
        }
        else {
            tickLabel = getTickUnit().valueToString(currentTickValue);
        }

        TextAnchor anchor = null;
        TextAnchor rotationAnchor = null;
        double angle = 0.0;
        if (isVerticalTickLabels()) {
            if (edge == RectangleEdge.LEFT) {
                anchor = TextAnchor.BOTTOM_CENTER;
                rotationAnchor = TextAnchor.BOTTOM_CENTER;
                angle = -Math.PI / 2.0;
            }
            else {
                anchor = TextAnchor.BOTTOM_CENTER;
                rotationAnchor = TextAnchor.BOTTOM_CENTER;
                angle = Math.PI / 2.0;
            }
        }
        else {
            if (edge == RectangleEdge.LEFT) {
                anchor = TextAnchor.CENTER_RIGHT;
                rotationAnchor = TextAnchor.CENTER_RIGHT;
            }
            else {
                anchor = TextAnchor.CENTER_LEFT;
                rotationAnchor = TextAnchor.CENTER_LEFT;
            }
        }

        ValueTick tick = new NumberTick(new Double(currentTickValue),
                tickLabel, anchor, rotationAnchor, angle);
        Font font=getTickLabelFont().deriveFont(Font.BOLD,(float)(getTickLabelFont().getSize()*1.1));
        g2.setFont(font);
        Color clr=(Color) getTickLabelPaint();
        g2.setBackground(clr);
        g2.setColor(Color.WHITE);
        g2.setPaint(Color.WHITE);
        float[] anchorPoint = calculateAnchorPoint(tick, cursor,
                dataArea, edge);
        int x=0,y=0,w=0,h=0;
        Label l = new Label(tick.getText());
        x=(int)anchorPoint[0];
        y=(int)anchorPoint[1];
        w=l.getFontMetrics(font).stringWidth(tick.getText());
        h=l.getFontMetrics(font).getHeight()-2;
        if (isVerticalTickLabels()) {
            if (edge == RectangleEdge.LEFT) {
                x=x-w/2;
                y=y-h;
            }
        } else {
            if (edge == RectangleEdge.LEFT) {
                x=x-w;
                y=y-h/2;
            } else {
                y=y-h/2;
            }
        }

        g2.clearRect(x,y,w,h);
        g2.setColor(Color.WHITE);
        g2.setPaint(Color.WHITE);
        TextUtilities.drawRotatedString(tick.getText(), g2,
                anchorPoint[0], anchorPoint[1], tick.getTextAnchor(),
                tick.getAngle(), tick.getRotationAnchor());

    }

}

