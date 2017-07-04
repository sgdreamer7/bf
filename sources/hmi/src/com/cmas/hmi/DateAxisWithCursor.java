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
import java.text.DateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import org.jfree.chart.axis.*;
import org.jfree.chart.event.AxisChangeEvent;
import org.jfree.chart.plot.PlotRenderingInfo;
import org.jfree.data.time.Month;
import org.jfree.data.time.RegularTimePeriod;
import org.jfree.data.time.Year;
import org.jfree.text.TextUtilities;
import org.jfree.ui.RectangleEdge;
import org.jfree.ui.TextAnchor;

/**
 *
 * @author vns
 */
public class DateAxisWithCursor extends DateAxis {

    private double cursorValue=0.0;
    private String fmt="d-MMM-yy HH:mm:ss";
    
    public DateAxisWithCursor(String label, TimeZone zone, Locale locale) {
        super(label, zone, locale);
    }

    @SuppressWarnings("deprecation")
    public DateAxisWithCursor(String label, TimeZone zone) {
        super(label, zone);
    }

    public DateAxisWithCursor(String label) {
        super(label);
    }

    public DateAxisWithCursor(String label,String fmt) {
        super(label);
        this.fmt=fmt;
    }

    public DateAxisWithCursor() {
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
                    cursorShape.moveTo(xPos-delta,cursor-delta);
                    cursorShape.lineTo(xPos+delta,cursor+delta);
                    cursorShape.lineTo(xPos-delta,cursor+delta);
                    cursorShape.lineTo(xPos+delta,cursor-delta);
                    cursorShape.lineTo(xPos-delta,cursor-delta);
                } else if (edge == RectangleEdge.BOTTOM) {
                    double xPos=valueToJava2D(cursorValue, dataArea, edge);
                    cursorShape.moveTo(xPos-delta,cursor-delta);
                    cursorShape.lineTo(xPos+delta,cursor+delta);
                    cursorShape.lineTo(xPos-delta,cursor+delta);
                    cursorShape.lineTo(xPos+delta,cursor-delta);
                    cursorShape.lineTo(xPos-delta,cursor-delta);
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

        Date tickDate = new Date((long)cursorValue);
        String tickLabel;
        DateFormat formatter = getDateFormatOverride();
        if (formatter != null) {
            tickLabel = formatter.format(tickDate);
        }
        else {
            tickLabel= getStandardTickUnits().getCeilingTickUnit(0.0).valueToString(tickDate.getTime());
//            tickLabel = getTickUnit().dateToString(tickDate);
        }
        tickLabel=new MyDateFormat(0, this.fmt).format(tickDate);
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

        ValueTick tick = new DateTick(tickDate, tickLabel, anchor,
                rotationAnchor, angle);

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
        y=(int)anchorPoint[1]+2;
        w=l.getFontMetrics(font).stringWidth(tick.getText());
        h=l.getFontMetrics(font).getHeight()-2;
        if (isVerticalTickLabels()) {
            if (edge == RectangleEdge.BOTTOM) {
                x=x-w/2;
                y=y-h;
            }
        } else {
            if (edge == RectangleEdge.BOTTOM) {
                x=x-w/2;
            } else {
                x=x-w/2;
                y=y-h/2;
            }
        }
        if (x-w/2<0) {
            x=w/2;
        }
        if (x+w>dataArea.getMaxX()) {
            x=(int)dataArea.getMaxX()-w;
        }
        g2.clearRect(x,y,w,h);
        g2.setColor(Color.WHITE);
        g2.setPaint(Color.WHITE);
        TextUtilities.drawRotatedString(tick.getText(), g2,
                x+w/2, anchorPoint[1], tick.getTextAnchor(),
                tick.getAngle(), tick.getRotationAnchor());
        return;
    }

    protected void drawCursorValueVertical(Graphics2D g2,double cursor,
            Rectangle2D dataArea, RectangleEdge edge) {

        Date tickDate = new Date((long)cursorValue);
        String tickLabel;
        DateFormat formatter = getDateFormatOverride();
        if (formatter != null) {
            tickLabel = formatter.format(tickDate);
        }
        else {
            tickLabel = getTickUnit().dateToString(tickDate);
        }
        tickLabel=new MyDateFormat(0, this.fmt).format(tickDate);
        TextAnchor anchor = null;
        TextAnchor rotationAnchor = null;
        double angle = 0.0;
        if (isVerticalTickLabels()) {
            anchor = TextAnchor.BOTTOM_CENTER;
            rotationAnchor = TextAnchor.BOTTOM_CENTER;
            if (edge == RectangleEdge.LEFT) {
                angle = -Math.PI / 2.0;
            }
            else {
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

        ValueTick tick = new DateTick(tickDate, tickLabel, anchor,
                rotationAnchor, angle);

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
    
    public List refreshTicks(Graphics2D g2,
                             AxisState state,
                             Rectangle2D dataArea,
                             RectangleEdge edge) {

        List result = null;
        if (RectangleEdge.isTopOrBottom(edge)) {
            result = refreshTicksHorizontal(g2, dataArea, edge);
        }
        else if (RectangleEdge.isLeftOrRight(edge)) {
            result = refreshTicksVertical(g2, dataArea, edge);
        }
        return result;

    }
    
    protected List refreshTicksHorizontal(Graphics2D g2,
                Rectangle2D dataArea, RectangleEdge edge) {

        List result = new java.util.ArrayList();

        Font tickLabelFont = getTickLabelFont();
        g2.setFont(tickLabelFont);

        if (isAutoTickUnitSelection()) {
            selectAutoTickUnit(g2, dataArea, edge);
        }

        DateTickUnit unit = getTickUnit();
        Date tickDate = calculateLowestVisibleTickValue(unit);
        Date upperDate = getMaximumDate();
        
        while (tickDate.before(upperDate)) {
            // could add a flag to make the following correction optional...
            tickDate = correctTickDateForPosition(tickDate, unit,
                    getTickMarkPosition());

            long lowestTickTime = tickDate.getTime();
            long distance = unit.addToDate(tickDate, getTimeZone()).getTime()
                    - lowestTickTime;
            int minorTickSpaces = getMinorTickCount();
            if (minorTickSpaces <= 0) {
                minorTickSpaces = unit.getMinorTickCount();
            }
            for (int minorTick = 1; minorTick < minorTickSpaces; minorTick++) {
                long minorTickTime = lowestTickTime - distance
                        * minorTick / minorTickSpaces;
                if (minorTickTime > 0 && getRange().contains(minorTickTime)
                        && (!isHiddenValue(minorTickTime))) {
                    result.add(new DateTick(TickType.MINOR,
                            new Date(minorTickTime), "", TextAnchor.TOP_CENTER,
                            TextAnchor.CENTER, 0.0));
                }
            }

            if (!isHiddenValue(tickDate.getTime())) {
                // work out the value, label and position
                String tickLabel;
                DateFormat formatter = getDateFormatOverride();
                if (formatter != null) {
                    tickLabel = formatter.format(tickDate);
                }
                else {
                    tickLabel = getTickUnit().dateToString(tickDate);
                }
                if (result.size()==0) {
                    tickLabel=new MyDateFormat(0, "d-MMM-yy HH:mm:ss").format(tickDate);
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

                Tick tick = new DateTick(tickDate, tickLabel, anchor,
                        rotationAnchor, angle);
                result.add(tick);

                long currentTickTime = tickDate.getTime();
                tickDate = unit.addToDate(tickDate, getTimeZone());
                long nextTickTime = tickDate.getTime();
                for (int minorTick = 1; minorTick < minorTickSpaces;
                        minorTick++){
                    long minorTickTime = currentTickTime
                            + (nextTickTime - currentTickTime)
                            * minorTick / minorTickSpaces;
                    if (getRange().contains(minorTickTime)
                            && (!isHiddenValue(minorTickTime))) {
                        result.add(new DateTick(TickType.MINOR,
                                new Date(minorTickTime), "",
                                TextAnchor.TOP_CENTER, TextAnchor.CENTER,
                                0.0));
                    }
                }

            }
            else {
                tickDate = unit.rollDate(tickDate, getTimeZone());
                continue;
            }

        }
        return result;

    }
    
    protected List refreshTicksVertical(Graphics2D g2,
            Rectangle2D dataArea, RectangleEdge edge) {

        List result = new java.util.ArrayList();

        Font tickLabelFont = getTickLabelFont();
        g2.setFont(tickLabelFont);

        if (isAutoTickUnitSelection()) {
            selectAutoTickUnit(g2, dataArea, edge);
        }
        DateTickUnit unit = getTickUnit();
        Date tickDate = calculateLowestVisibleTickValue(unit);
        Date upperDate = getMaximumDate();

        while (tickDate.before(upperDate)) {

            // could add a flag to make the following correction optional...
            tickDate = correctTickDateForPosition(tickDate, unit,
                    getTickMarkPosition());

            long lowestTickTime = tickDate.getTime();
            long distance = unit.addToDate(tickDate, getTimeZone()).getTime()
                    - lowestTickTime;
            int minorTickSpaces = getMinorTickCount();
            if (minorTickSpaces <= 0) {
                minorTickSpaces = unit.getMinorTickCount();
            }
            for (int minorTick = 1; minorTick < minorTickSpaces; minorTick++) {
                long minorTickTime = lowestTickTime - distance
                        * minorTick / minorTickSpaces;
                if (minorTickTime > 0 && getRange().contains(minorTickTime)
                        && (!isHiddenValue(minorTickTime))) {
                    result.add(new DateTick(TickType.MINOR,
                            new Date(minorTickTime), "", TextAnchor.TOP_CENTER,
                            TextAnchor.CENTER, 0.0));
                }
            }
            if (!isHiddenValue(tickDate.getTime())) {
                // work out the value, label and position
                String tickLabel;
                DateFormat formatter = getDateFormatOverride();
                if (formatter != null) {
                    tickLabel = formatter.format(tickDate);
                }
                else {
                    tickLabel = getTickUnit().dateToString(tickDate);
                }
                if (result.size()==0) {
                    tickLabel=new MyDateFormat(0, "d-MMM-yy HH:mm:ss").format(tickDate);
                }
                TextAnchor anchor = null;
                TextAnchor rotationAnchor = null;
                double angle = 0.0;
                if (isVerticalTickLabels()) {
                    anchor = TextAnchor.BOTTOM_CENTER;
                    rotationAnchor = TextAnchor.BOTTOM_CENTER;
                    if (edge == RectangleEdge.LEFT) {
                        angle = -Math.PI / 2.0;
                    }
                    else {
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

                Tick tick = new DateTick(tickDate, tickLabel, anchor,
                        rotationAnchor, angle);
                result.add(tick);
                long currentTickTime = tickDate.getTime();
                tickDate = unit.addToDate(tickDate, getTimeZone());
                long nextTickTime = tickDate.getTime();
                for (int minorTick = 1; minorTick < minorTickSpaces;
                        minorTick++){
                    long minorTickTime = currentTickTime
                            + (nextTickTime - currentTickTime)
                            * minorTick / minorTickSpaces;
                    if (getRange().contains(minorTickTime)
                            && (!isHiddenValue(minorTickTime))) {
                        result.add(new DateTick(TickType.MINOR,
                                new Date(minorTickTime), "",
                                TextAnchor.TOP_CENTER, TextAnchor.CENTER,
                                0.0));
                    }
                }
            }
            else {
                tickDate = unit.rollDate(tickDate, getTimeZone());
            }
        }
        return result;
    }

    private Date correctTickDateForPosition(Date time, DateTickUnit unit,
            DateTickMarkPosition position) {
        Date result = time;
        switch (unit.getUnit()) {
            case (DateTickUnit.MILLISECOND) :
            case (DateTickUnit.SECOND) :
            case (DateTickUnit.MINUTE) :
            case (DateTickUnit.HOUR) :
            case (DateTickUnit.DAY) :
                break;
            case (DateTickUnit.MONTH) :
                result = calculateDateForPosition(new Month(time,
                        getTimeZone(), Locale.getDefault()), position);
                break;
            case(DateTickUnit.YEAR) :
                result = calculateDateForPosition(new Year(time,
                        getTimeZone(), Locale.getDefault()), position);
                break;

            default: break;
        }
        return result;
    }
    
    private Date calculateDateForPosition(RegularTimePeriod period,
                                          DateTickMarkPosition position) {

        if (position == null) {
            throw new IllegalArgumentException("Null 'position' argument.");
        }
        Date result = null;
        if (position == DateTickMarkPosition.START) {
            result = new Date(period.getFirstMillisecond());
        }
        else if (position == DateTickMarkPosition.MIDDLE) {
            result = new Date(period.getMiddleMillisecond());
        }
        else if (position == DateTickMarkPosition.END) {
            result = new Date(period.getLastMillisecond());
        }
        return result;

    }
}
