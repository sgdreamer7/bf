/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Paint;
import java.awt.Stroke;
import java.awt.geom.Line2D;
import java.awt.geom.Rectangle2D;
import org.jfree.chart.axis.ValueAxis;
import org.jfree.chart.entity.EntityCollection;
import org.jfree.chart.labels.XYToolTipGenerator;
import org.jfree.chart.plot.CrosshairState;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.PlotRenderingInfo;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYItemRendererState;
import org.jfree.chart.renderer.xy.XYStepRenderer;
import org.jfree.chart.urls.XYURLGenerator;
import org.jfree.data.xy.XYDataset;
import org.jfree.ui.RectangleEdge;

/**
 *
 * @author vns
 */
public class DigitalRenderer extends XYStepRenderer {

    private Color color1=new Color(255,0,0);
    private Color color2=new Color(0,127,0);
    
    public DigitalRenderer(XYToolTipGenerator toolTipGenerator, XYURLGenerator urlGenerator) {
        super(toolTipGenerator, urlGenerator);
    }

    public DigitalRenderer(Color color1,Color color2) {
        this.color1=color1;
        this.color2=color2;
    }

    public Color getColor1() {
        return color1;
    }

    public void setColor1(Color color1) {
        this.color1 = color1;
    }

    public Color getColor2() {
        return color2;
    }

    public void setColor2(Color color2) {
        this.color2 = color2;
    }

    public void drawItem(Graphics2D g2,
                         XYItemRendererState state,
                         Rectangle2D dataArea,
                         PlotRenderingInfo info,
                         XYPlot plot,
                         ValueAxis domainAxis,
                         ValueAxis rangeAxis,
                         XYDataset dataset,
                         int series,
                         int item,
                         CrosshairState crosshairState,
                         int pass) {

        // do nothing if item is not visible
        if (!getItemVisible(series, item)) {
            return;
        }

        PlotOrientation orientation = plot.getOrientation();
        
        // get the data point...
        double x1 = dataset.getXValue(series, item);
        double y1 = dataset.getYValue(series, item);
        
        Stroke seriesStroke = getItemStroke(series, item);
        g2.setStroke(seriesStroke);



        RectangleEdge xAxisLocation = plot.getDomainAxisEdge();
        RectangleEdge yAxisLocation = plot.getRangeAxisEdge();
        double transX1 = domainAxis.valueToJava2D(x1, dataArea, xAxisLocation);
        double transY1 = (Double.isNaN(y1) ? Double.NaN
                : rangeAxis.valueToJava2D(y1, dataArea, yAxisLocation));

        if (pass == 0 && item > 0) {
            // get the previous data point...
            double x0 = dataset.getXValue(series, item - 1);
            double y0 = dataset.getYValue(series, item - 1);
            double transX0 = domainAxis.valueToJava2D(x0, dataArea,
                    xAxisLocation);
            double transY0 = (Double.isNaN(y0) ? Double.NaN
                    : rangeAxis.valueToJava2D(y0, dataArea, yAxisLocation));

            if (orientation == PlotOrientation.HORIZONTAL) {
                if (transY0 == transY1) {
                    // this represents the situation
                    // for drawing a horizontal bar.
                    if ((Math.round(y1) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    drawLine(g2, state.workingLine, transY0, transX0, transY1,
                            transX1);
                }
                else {  //this handles the need to perform a 'step'.

                    // calculate the step point
                    if ((Math.round(y0) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    double transXs = transX0 + (getStepPoint()
                            * (transX1 - transX0));
                    drawLine(g2, state.workingLine, transY0, transX0, transY0,
                            transXs);
                    if ((Math.round(y1) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    drawLine(g2, state.workingLine, transY0, transXs, transY1,
                            transXs);
                    drawLine(g2, state.workingLine, transY1, transXs, transY1,
                            transX1);
                }
            }
            else if (orientation == PlotOrientation.VERTICAL) {
                if (transY0 == transY1) { // this represents the situation
                                          // for drawing a horizontal bar.
                    if ((Math.round(y1) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    drawLine(g2, state.workingLine, transX0, transY0, transX1,
                            transY1);
                }
                else {  //this handles the need to perform a 'step'.
                    // calculate the step point
                    if ((Math.round(y0) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    double transXs = transX0 + (getStepPoint()
                            * (transX1 - transX0));
                    drawLine(g2, state.workingLine, transX0, transY0, transXs,
                            transY0);
                    if ((Math.round(y1) % 2)==0) {
                        g2.setPaint(color1);
                    } else {
                        g2.setPaint(color2);
                    }
                    drawLine(g2, state.workingLine, transXs, transY0, transXs,
                            transY1);
                    drawLine(g2, state.workingLine, transXs, transY1, transX1,
                            transY1);
                }
            }

            // submit this data item as a candidate for the crosshair point
            int domainAxisIndex = plot.getDomainAxisIndex(domainAxis);
            int rangeAxisIndex = plot.getRangeAxisIndex(rangeAxis);
            updateCrosshairValues(crosshairState, x1, y1, domainAxisIndex,
                    rangeAxisIndex, transX1, transY1, orientation);

            // collect entity and tool tip information...
            EntityCollection entities = state.getEntityCollection();
            if (entities != null) {
                addEntity(entities, null, dataset, series, item, transX1,
                        transY1);
            }

        }

        if (pass == 1) {
            // draw the item label if there is one...
            if (isItemLabelVisible(series, item)) {
                double xx = transX1;
                double yy = transY1;
                if (orientation == PlotOrientation.HORIZONTAL) {
                    xx = transY1;
                    yy = transX1;
                }
                drawItemLabel(g2, orientation, dataset, series, item, xx, yy,
                        (y1 < 0.0));
            }
        }
    }
    
    private void drawLine(Graphics2D g2, Line2D line, double x0, double y0,
            double x1, double y1) {
        if (Double.isNaN(x0) || Double.isNaN(x1) || Double.isNaN(y0)
                || Double.isNaN(y1)) {
            return;
        }
        line.setLine(x0, y0, x1, y1);
        g2.draw(line);
    }
    
}
