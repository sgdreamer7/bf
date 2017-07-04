/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

/**
 *
 * @author vns
 */
import com.Ostermiller.util.PasswordDialog;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Ellipse2D;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import org.jfree.chart.*;
import org.jfree.chart.annotations.*;
import org.jfree.chart.axis.*;
import org.jfree.chart.event.AxisChangeEvent;
import org.jfree.chart.event.AxisChangeListener;
import org.jfree.chart.event.PlotChangeEvent;
import org.jfree.chart.labels.StandardXYToolTipGenerator;
import org.jfree.chart.plot.*;
import org.jfree.chart.renderer.xy.*;
import org.jfree.chart.title.TextTitle;
import org.jfree.data.Range;
import org.jfree.data.time.FixedMillisecond;
import org.jfree.data.time.TimeSeries;
import org.jfree.data.time.TimeSeriesCollection;
import org.jfree.data.time.TimeSeriesDataItem;
import org.jfree.ui.Layer;
import org.jfree.ui.RectangleEdge;
import org.jfree.ui.TextAnchor;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class TrendsFrame extends JFrame {

    protected static ResourceBundle bundle;
    protected static TrendsFrame frame;
    private static JPopupMenu menu = null;
    private static TimerTask tt;
    protected java.util.Timer timer = new java.util.Timer(true);
    protected boolean busy;

    static {
        bundle = ResourceBundle.getBundle("com.cmas.hmi.resources.TrendsView", Locale.getDefault());
    }
    public static JToggleButton modeButton = null;
    public static final int LineType = 0;
    public static final int BarType = 1;
    public static final int DifferenceType = 2;
    public static final int StepType = 3;
    public static final int VLineType = 4;
    public static final int VZoneType = 5;
    public static final int SectionType = 6;
    public static final int HLineType = 7;
    public static final int HZoneType = 8;
    public static final int TrendlineType = 9;
    public static final int LeftValueMarkType = 10;
    public static final int RightValueMarkType = 11;
    public static final int SymbolType = 12;
    public static final int ProfileType = 13;
    public static final int OHLCVType = 14;
    public static final int DigitalType = 15;
    public static final int SolidLineStyle = 0;
    public static final int DottedLineStyle = 1;
    public static final int DashedLineStyle = 2;
    public static final int AxisLineStyle = 3;
    public static final int Axis2LineStyle = 4;
    private JFreeChart chart = null;
    private ChartPanel chartPanel = null;
    private XYPlot plot = null;
    private XMLConfig config = null;
    private boolean isRealtime = true;
    private Timestamp finishTS = new Timestamp();
    private Timestamp startTS = new Timestamp();
    private JSONObject args = null;
    private String[] indName = null;
    private Number[] indGroup = null;
    private Number[] indInverted = null;
    private Number[] indType = null;
    private Number[] indThickness = null;
    private Number[] indLinestyle = null;
    private Color[] indColor = null;
    private Color[] indColor2 = null;
    private Number[] indSymbolcode = null;
    private Number[] indScale = null;
    private Number[] indShift = null;
    private String[] indSplit = null;
    private boolean[] indShow = null;
    private HashMap<String, ArrayList<Integer>> indicatorsSplits = null;
    private XYTextAnnotation[] indCursorValue = null;
    private XYLineAnnotation[] indCursorValueLine = null;    
    private XYItemRenderer[] indRenderer = null;
    private ArrayList<XYAnnotation>[] indRendererAnnotations = null;
    private Number timescale = new Long(86400);
    private Font symbolsFont = getFont("smbls.ttf", 8);
    private Font plainFont = getFont("tahoma.ttf", 8);
    private Font boldFont = getFont("tahomabd.ttf", 8);
    private String dataValues = "";
    private long ShiftWidth = 1;
    private boolean showCursorValues = false;
    private JComboBox splitsCombobox = null;
    private JLabel CurrentDatetime=new JLabel();
    
    public TrendsFrame() {

//        int dismissDelay = Integer.MAX_VALUE;
//        ToolTipManager.sharedInstance().setDismissDelay(dismissDelay);
//        ToolTipManager.sharedInstance().setInitialDelay(0);
//        ToolTipManager.sharedInstance().setReshowDelay(0);
        ToolTipManager.sharedInstance().setLightWeightPopupEnabled(true);
        busy = false;

        addWindowListener(new WindowAdapter() {

            @Override
            public void windowClosing(WindowEvent e) {
                allDone();

            }
        });

        this.getRootPane().registerKeyboardAction(
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        allDone();
                    }
                },
                KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0),
                JComponent.WHEN_IN_FOCUSED_WINDOW);
        getRootPane().registerKeyboardAction(
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        String str;
                        PasswordDialog pd = new PasswordDialog(null, "Введите пароль для разблокировки:");
                        pd.setCancelText("Отмена");
                        pd.setOKText("Ввод");
                        pd.setNameLabel("Имя пользователя");
                        pd.setName("");
                        pd.setPassLabel("Пароль: ");
                        pd.setPass("");
                        Dimension size = new Dimension(600, 150);
                        pd.setPreferredSize(size);
                        pd.setMinimumSize(size);
                        size = Toolkit.getDefaultToolkit().getScreenSize();
                        pd.setLocation((size.width - 600) / 2 + Main.screen * size.width, (size.height - 150) / 2);
                        boolean r = pd.showDialog();
                        if (r == true) {
                            str = pd.getName() + "\n" + pd.getPass();
                        } else {
                            str = "";
                        }
                        String filename = "C:/Works/temp/pwd.txt";
                        Integer keycode = KeyEvent.VK_F12;
                        BufferedWriter out;
                        try {
                            out = new BufferedWriter(new FileWriter(filename));
                            out.write(str);
                            out.close();
                        } catch (IOException ex) {
                        }
                        try {
                            Robot robot = new Robot();
                            robot.keyPress(keycode.intValue());
                        } catch (AWTException ex) {
                        }
                    }
                },
                KeyStroke.getKeyStroke(KeyEvent.VK_L, KeyEvent.CTRL_MASK),
                JComponent.WHEN_IN_FOCUSED_WINDOW);

        setResizable(false);
        setUndecorated(true);
        Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
        setSize(size);
        setLocation(Main.screen * size.width, 0);
        setLayout(new BorderLayout());
        ((JComponent) getContentPane()).setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 0));

        this.plot = new XYPlot();
        this.plot.setOrientation(PlotOrientation.VERTICAL);
        this.plot.setDomainGridlinesVisible(true);
        this.plot.setDomainCrosshairVisible(true);
        this.plot.setDomainCrosshairStroke(getStroke(1f, DottedLineStyle));
        this.plot.setDomainCrosshairPaint(new Color(0x0000FF));
        this.plot.setDomainCrosshairLockedOnData(false);
        this.plot.setDomainGridlinePaint(new Color(0x808080));
        this.plot.setRangeGridlinesVisible(false);
        this.plot.setRangeCrosshairVisible(true);
        this.plot.setRangeCrosshairStroke(getStroke(1f, DottedLineStyle));
        this.plot.setRangeCrosshairPaint(new Color(0x0000FF));
        this.plot.setRangeCrosshairLockedOnData(false);
        this.plot.setRangeTickBandPaint(new Color(0xE0E0E0));
        this.plot.setRangeGridlinePaint(new Color(0x808080));
        this.plot.setNoDataMessage("Нет данных");
        this.plot.setNoDataMessageFont(boldFont.deriveFont((float) 24.0));


        timescale = new Long(300);
        int weekdays = 7;
        int weekends = 0;
        SegmentedTimeline timeline = new SegmentedTimeline(SegmentedTimeline.DAY_SEGMENT_SIZE, weekdays, weekends);
        Timestamp ts = new Timestamp(1970, 1, 1, 0, 0, 0);
        ts.SetMonday();
        timeline.setStartTime(ts.getDate().getTime() - 3600000);
        DateAxisWithCursor timeAxis = new DateAxisWithCursor("Дата и время", "d-MMM-yy HH:mm:ss");
        timeAxis.setTimeline(timeline);
        ts.SetNow();
        finishTS = ts.clone();
        ts.AddSeconds(-timescale.longValue());
        startTS = ts.clone();

        double margin = 0.0001 * (finishTS.getMilliSeconds() - startTS.getMilliSeconds());
        double left_margin = margin;
        double right_margin = margin;
        timeAxis.setAutoRange(false);
        timeAxis.setRange(startTS.getMilliSeconds() - left_margin, finishTS.getMilliSeconds() + right_margin);
        Color timeAxisColor = new Color(0x000000);
        timeAxis.setAxisLinePaint(timeAxisColor);
        timeAxis.setLabelPaint(timeAxisColor);
        timeAxis.setTickLabelPaint(timeAxisColor);
        timeAxis.setTickMarkPaint(timeAxisColor);

        TickUnits units = getTickUnits(0);

        timeAxis.setStandardTickUnits(units);
        timeAxis.setAutoTickUnitSelection(true);

        timeAxis.setTickLabelFont(plainFont.deriveFont((float) 10.0));
        timeAxis.setLabelFont(boldFont.deriveFont((float) 8.0));

        timeAxis.addChangeListener(new AxisChangeListener() {

            @Override
            public void axisChanged(AxisChangeEvent event) {
                DateAxisWithCursor axis = (DateAxisWithCursor) event.getAxis();
                if (axis.isAutoRange()) {

                    double margin = 0.0001 * (finishTS.getMilliSeconds() - startTS.getMilliSeconds());
                    double left_margin = margin;
                    double right_margin = margin;
                    if (isRealtime == true) {
                        right_margin = right_margin * 1000 / 4;
                    }
                    Range range = new Range(startTS.getMilliSeconds() - left_margin, finishTS.getMilliSeconds() + right_margin);
                    axis.setRange(range, true, true);

                }
            }
        });

        this.plot.setDomainAxis(0, timeAxis, true);
        this.plot.setDomainAxisLocation(0, AxisLocation.BOTTOM_OR_LEFT);



        this.chart = new JFreeChart(
                "",
                boldFont.deriveFont((float) 8.0),
                this.plot,
                false);
        this.chart.setAntiAlias(false);
        this.chart.setTextAntiAlias(true);

        this.chartPanel = new ChartPanel(this.chart, 32767, 32767, 100, 100, 32767, 32767, true, false, false, false, false, false, true) {

            @Override
            public String getToolTipText(MouseEvent e) {
                Point p = e.getPoint();
                ChartRenderingInfo CRI = chartPanel.getChartRenderingInfo();
                java.awt.geom.Rectangle2D r = CRI.getPlotInfo().getDataArea();
                return r.contains(p) ? (showCursorValues ? dataValues : "") : "";
            }

            @Override
            public Point getToolTipLocation(MouseEvent e) {
                Point p = e.getPoint();
                p.y += 15;
                return new Point(0, 0);
            }
        };
        this.chartPanel.setChart(this.chart);
        this.chartPanel.setHorizontalAxisTrace(false);
        this.chartPanel.setVerticalAxisTrace(false);
        this.chartPanel.setMouseZoomable(false);
        this.chartPanel.setDomainZoomable(!(isRealtime));
        this.chartPanel.setRangeZoomable(!(isRealtime));
        this.chartPanel.setFillZoomRectangle(false);
        this.chartPanel.setDoubleBuffered(true);
        this.chartPanel.setBackground(new Color(0xFFFFFF));
        this.chartPanel.setRefreshBuffer(false);
        this.chartPanel.setDisplayToolTips(true);
        this.chartPanel.setDismissDelay(Integer.MAX_VALUE);
        this.chartPanel.setInitialDelay(0);
        this.chartPanel.setReshowDelay(0);
        this.chartPanel.setCursor(Cursor.getPredefinedCursor(Cursor.CROSSHAIR_CURSOR));

        this.chartPanel.addChartMouseListener(new ChartMouseListener() {

            @Override
            public void chartMouseMoved(ChartMouseEvent arg0) {
                ProcessChartMouseMoved(arg0);
            }

            @Override
            public void chartMouseClicked(ChartMouseEvent arg0) {
//                ProcessChartMouseClicked(arg0);
            }
        });


        this.add(this.chartPanel, BorderLayout.CENTER);

        JPanel toolbarPanel = new JPanel(new GridBagLayout());
        toolbarPanel.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 0));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.anchor = GridBagConstraints.LINE_START;
        gbc.fill = GridBagConstraints.NONE;
        gbc.gridheight = 1;
        gbc.gridwidth = 1;
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.weightx = 0;
        gbc.weighty = 0;//1*((float)size.getWidth()/(float)size.getWidth())/(1920.0/1200.0);


        modeButton = createToggleButton(
                "",
                "Выбор режима просмотра графиков (архивный/реального времени)",
                "RealtimeButton.icon",
                "RealtimeButton.selectedIcon",
                isRealtime,
                new ActionListener() {

                    @Override
                    public void actionPerformed(java.awt.event.ActionEvent evt) {
                        changeMode(((JToggleButton) evt.getSource()).isSelected());
                    }
                });
        toolbarPanel.add(
                modeButton,
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Прокрутка на 1 экран назад",
                "LeftButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        PanChart(-startTS.difSeconds(finishTS));
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Прокрутка на 1 экран вперед",
                "RightButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        PanChart(startTS.difSeconds(finishTS));
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Обновить графики",
                "RecycleButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        BuildChart();
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - смена 1",
                "Shift1.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByShift(1);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - смена 2",
                "Shift2.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByShift(2);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - смена 3",
                "Shift3.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByShift(3);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - предыдущая смена",
                "ShiftPrev.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByShift(-1);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - Текущая смена",
                "ShiftCur.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByShift(0);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 5 минут",
                "Minute5Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(5);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 15 минут",
                "Minute15Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(15);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 1 час",
                "Hour1Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(60);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 2 часа",
                "Hour2Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(120);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 4 часа",
                "Hour4Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(240);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 8 часов",
                "Hour8Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        AlignChartByMinutes(480);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Период просмотра - 24 часа",
                "Hour24Button.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        if (isRealtime == false) {
                            startTS.setHour(0);
                            startTS.setMinute(0);
                            startTS.setSecond(0);
                            finishTS = startTS.clone();
                            finishTS.AddMinutes(1440);
                            BuildChart();
                        }
                    }
                }),
                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(new JPanel(), gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - 5 дней",
//                "Days5Button.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            startTS.setHour(0);
//                            startTS.setMinute(0);
//                            startTS.setSecond(0);
//                            startTS.SetMonday();
//                            finishTS = startTS.clone();
//                            finishTS.AddMinutes(1440 * 5);
//                            BuildChart();
//                        }
//                    }
//                }),
//                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - 7 дней",
//                "Week1Button.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            startTS.setHour(0);
//                            startTS.setMinute(0);
//                            startTS.setSecond(0);
//                            startTS.SetMonday();
//                            finishTS = startTS.clone();
//                            finishTS.AddMinutes(1440 * 7);
//                            BuildChart();
//                        }
//                    }
//                }),
//                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(new JPanel(), gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - 1 месяц",
//                "Month1Button.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            startTS.setHour(0);
//                            startTS.setMinute(0);
//                            startTS.setSecond(0);
//                            startTS.setDay(1);
//                            finishTS = startTS.clone();
//                            finishTS.AddMonths(1);
//                            BuildChart();
//                        }
//                    }
//                }),
//                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - 3 месяца",
//                "Month3Button.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            startTS.setHour(0);
//                            startTS.setMinute(0);
//                            startTS.setSecond(0);
//                            startTS.setDay(1);
//                            finishTS = startTS.clone();
//                            finishTS.AddMonths(3);
//                            BuildChart();
//                        }
//                    }
//                }),
//                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - 1 год",
//                "Year1Button.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            startTS.setHour(0);
//                            startTS.setMinute(0);
//                            startTS.setSecond(0);
//                            startTS.setDay(1);
//                            startTS.setMonth(12);
//                            finishTS = startTS.clone();
//                            finishTS.AddMonths(12);
//                            BuildChart();
//                        }
//                    }
//                }),
//                gbc);
//        gbc.gridx++;
//        toolbarPanel.add(new JPanel(), gbc);
//        gbc.gridx++;
//        toolbarPanel.add(
//                createButton(
//                "",
//                "Период просмотра - по выбору",
//                "PeriodButton.icon",
//                new ActionListener() {
//
//                    @Override
//                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime == false) {
//                            Timestamp tmp = startTS.clone();
//                            DateChooserDialog dateDialog = new DateChooserDialog(TrendsFrame.this, true, "Выбор даты начала периода");
//                            dateDialog.setLocationRelativeTo(TrendsFrame.this);
//                            Calendar cal = dateDialog.getResult(tmp.getCalendar());
//                            if (!(cal == null)) {
//                                dateDialog = new DateChooserDialog(TrendsFrame.this, true, "Выбор даты окончания периода");
//                                dateDialog.setLocationRelativeTo(TrendsFrame.this);
//                                Calendar cal2 = dateDialog.getResult(cal);
//                                if (!(cal2 == null)) {
//                                    tmp = new Timestamp(cal);
//                                    tmp.setHour(0);
//                                    tmp.setMinute(0);
//                                    tmp.setSecond(0);
//                                    startTS = tmp.clone();
//                                    tmp = new Timestamp(cal2);
//                                    tmp.setHour(0);
//                                    tmp.setMinute(0);
//                                    tmp.setSecond(0);
//                                    finishTS = tmp.clone();
//                                    BuildChart();
//                                }
//                            }
//                        }
//                    }
//                }),
//                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Установить начало графиков на выбранную дату",
                "CalendarButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        if (isRealtime == false) {
                            Timestamp tmp = startTS.clone();
                            DateChooserDialog dateDialog = new DateChooserDialog(TrendsFrame.this, true, "Выбор даты");
                            dateDialog.setLocationRelativeTo(TrendsFrame.this);
                            Calendar cal = dateDialog.getResult(tmp.getCalendar());
                            if (!(cal == null)) {
                                tmp = new Timestamp(cal);
                                tmp.setHour(0);
                                tmp.setMinute(0);
                                tmp.setSecond(0);
                                PanChart(startTS.difSeconds(tmp));
                            }
                        }
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Прокрутка графиков на выбранное количество времени назад",
                "LeftButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        if (isRealtime == false) {
                            PanChart(-ShiftWidth * 60);
                        }
                    }
                }),
                gbc);
        gbc.gridx++;
        final JComboBox ShiftWidthValue = new JComboBox();
        ShiftWidthValue.setModel(new DefaultComboBoxModel(new String[]{"1 мин", "5 мин", "15 мин", "1 час", "2 часа", "4 часа", "8 часов", "24 часа"}));
        ShiftWidthValue.setEditor(null);
        ShiftWidthValue.setMaximumSize(new java.awt.Dimension(88, 27));
        ShiftWidthValue.addItemListener(new java.awt.event.ItemListener() {

            @Override
            public void itemStateChanged(java.awt.event.ItemEvent evt) {
                switch (ShiftWidthValue.getSelectedIndex()) {
                    case 0:
                        ShiftWidth = 1;
                        break;
                    case 1:
                        ShiftWidth = 5;
                        break;
                    case 2:
                        ShiftWidth = 15;
                        break;
                    case 3:
                        ShiftWidth = 60;
                        break;
                    case 4:
                        ShiftWidth = 120;
                        break;
                    case 5:
                        ShiftWidth = 240;
                        break;
                    case 6:
                        ShiftWidth = 480;
                        break;
                    case 7:
                        ShiftWidth = 1440;
                        break;
                    default:
                        ShiftWidth = 1;
                        break;
                }
            }
        });
        ShiftWidthValue.setToolTipText("Выбранное количество времени для прокрутки вперед/назад");
        toolbarPanel.add(
                ShiftWidthValue,
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Прокрутка графиков на выбранное количество времени вперед",
                "RightButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        if (isRealtime == false) {
                            PanChart(ShiftWidth * 60);
                        }
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createToggleButton(
                "",
                showCursorValues ? "Показывать значения в курсоре" : "Не показывать значения в курсоре",
                "HorizontalLineButton.icon",
                "VerticalLineButton.icon",
                showCursorValues,
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        showCursorValues = ((JToggleButton) e.getSource()).isSelected();
                        ((JToggleButton) e.getSource()).setToolTipText(showCursorValues ? "Показывать значения в курсоре" : "Не показывать значения в курсоре");
                        if (showCursorValues == false) {
                            for (int i = 0; i < indCursorValue.length; i++) {
                                indRenderer[i].removeAnnotation(indCursorValue[i]);
                                indCursorValue[i]=null;
                                indRenderer[i].removeAnnotation(indCursorValueLine[i]);
                                indCursorValueLine[i]=null;
                            }
                        } else {
                            for (int i = 0; i < indCursorValue.length; i++) {
                                if (indCursorValue[i]==null) {
                                    indCursorValue[i] = new XYTextAnnotation(" ", 0, 0);
                                    indCursorValue[i].setTextAnchor(TextAnchor.BOTTOM_RIGHT);
                                    indCursorValue[i].setRotationAnchor(TextAnchor.BOTTOM_RIGHT);
                                    indCursorValue[i].setRotationAngle(0.0);
//                                    indCursorValue[i].setFont(boldFont.deriveFont((float) 16.0));
                                    indCursorValue[i].setFont(checkFont(plot.getRangeAxis(indGroup[i].intValue()).getTickLabelFont()));
                                    indCursorValue[i].setPaint((indColor[i].getRed() < 128) && (indColor[i].getGreen() < 128) && (indColor[i].getBlue() < 128) ? Color.white : Color.black);
                                    indCursorValue[i].setOutlinePaint(indColor[i].darker().darker());
                                    indCursorValue[i].setOutlineStroke(new BasicStroke(2));
                                    indCursorValue[i].setOutlineVisible(true);
                                    indCursorValue[i].setBackgroundPaint(indColor[i]);
                                    indCursorValue[i].setToolTipText("<html><b></b></html>");
                                    indRenderer[i].addAnnotation(indCursorValue[i], Layer.FOREGROUND);
                                }
                            }
                        }
                        if (isRealtime == false) {
                            Point p = MouseInfo.getPointerInfo().getLocation();
                            ProcessChartMouseMoved(
                                    new ChartMouseEvent(
                                    chart,
                                    new MouseEvent(
                                    chartPanel, 0, 0, 0,
                                    p.x, p.y,
                                    0, false),
                                    null));
                        }
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Сохранить тренд",
                "SaveButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        TrendsFrame.this.saveAsPDF(new StringBuffer());
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createTextButton(
                "Перья",
                "ВЫбор отображаемых параметров",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        final JPopupMenu penMenu = new JPopupMenu();
                        for (int i=0; i<indShow.length; i++) {
                            final int itemPos=i;
                            JCheckBoxMenuItem penMenuItem=new JCheckBoxMenuItem(indName[i],indShow[i]);
                            penMenuItem.addActionListener(new ActionListener() {
                                @Override
                                public void actionPerformed(ActionEvent e) {
                                    indShow[itemPos]=((JCheckBoxMenuItem)e.getSource()).getState();
                                    BuildChartThreaded();
                                }
                            });
                            penMenu.add(penMenuItem);
                        }
                        Point p = MouseInfo.getPointerInfo().getLocation();
                        Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
                        penMenu.show(TrendsFrame.this, p.x - Main.screen * size.width, p.y);
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createTextButton(
                "Меню трендов",
                "Вызов меню трендов",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
//                        if (isRealtime==false) {
                        Point p = MouseInfo.getPointerInfo().getLocation();
                        Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
                        TrendsFrame.menu.show(TrendsFrame.this, p.x - Main.screen * size.width, p.y);
//                        }
                    }
                }),
                gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        splitsCombobox = new JComboBox();
        splitsCombobox.addActionListener(new ActionListener() {

            @Override
            public void actionPerformed(ActionEvent ae) {
                BuildChart();
            }
        });
        toolbarPanel.add(
                splitsCombobox,
                gbc);
        gbc.gridx++;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.fill = GridBagConstraints.NONE;
        gbc.weightx = 0;
        gbc.gridx++;
        toolbarPanel.add(CurrentDatetime,gbc);
        gbc.gridx++;
        toolbarPanel.add(new JPanel(), gbc);
        gbc.gridx++;
        toolbarPanel.add(
                createButton(
                "",
                "Закрыть окно графиков",
                "CloseButton.icon",
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        try {
                            allDone();
                        } catch (Exception ex) {
                            // do nothing
                        }
                    }
                }),
                gbc);
        

        add(toolbarPanel, BorderLayout.NORTH);
    }

    public void initTrendsFrame(String request) throws MalformedURLException, JSONException, URISyntaxException, InterruptedException {
        Main.execute_async3(
                "get_report",
                new JSONObject(request),
                new Callback() {

                    @Override
                    public void call(Object param) {
                        JSONObject result=(JSONObject)((Object[])param)[1];
                        Object resultJSON = null;
                        try {
                            resultJSON = result.get("result");
                        } catch (JSONException ex) {
                            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                        config = new XMLConfig((String) resultJSON);

                        plot.setBackgroundPaint(config.getColor("/trends/panel/backcolor"));
                        plot.setNoDataMessagePaint(new Color(0xffffff - config.getColor("/trends/panel/backcolor").getRGB()));

                        indicatorsSplits = new HashMap<String, ArrayList<Integer>>();
                        splitsCombobox.removeAllItems();
                        timescale = config.getNumber("/trends/timescale");
                        Timestamp ts = new Timestamp(1970, 1, 1, 0, 0, 0);
                        ts.SetNow();
                        finishTS = ts.clone();
                        ts.AddSeconds(-timescale.longValue());
                        startTS = ts.clone();
                        String argsJSONSource = config.getString("/trends/data/args");
                        if (!(argsJSONSource.equals(""))) {
                            try {
                                args = new JSONObject(argsJSONSource);
                            } catch (JSONException ex) {
                                Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                                args = new JSONObject();
                            }
                        } else {
                            args = new JSONObject();
                        }
                        NodeList indicators = config.getNodes("/trends/indicators/indicator");
                        int ind_count = indicators.getLength();
                        indName = new String[ind_count];
                        indGroup = new Number[ind_count];
                        indInverted = new Number[ind_count];
                        indType = new Number[ind_count];
                        indThickness = new Number[ind_count];
                        indLinestyle = new Number[ind_count];
                        indColor = new Color[ind_count];
                        indColor2 = new Color[ind_count];
                        indSymbolcode = new Number[ind_count];
                        indScale = new Number[ind_count];
                        indShift = new Number[ind_count];
                        indRenderer = new XYItemRenderer[ind_count];
                        indRendererAnnotations = new ArrayList[ind_count];
                        indCursorValue = new XYTextAnnotation[ind_count];
                        indCursorValueLine = new XYLineAnnotation[ind_count];
                        indSplit = new String[ind_count];

                        plot.clearRangeAxes();
                        plot.clearRangeMarkers();
                        int rendererCount = plot.getRendererCount();
                        for (int i = rendererCount; i >= 0; i--) {
                            plot.setRenderer(i, null);
                        }
                        int datasetCount = plot.getDatasetCount();
                        for (int i = datasetCount; i >= 0; i--) {
                            plot.setDataset(i, null);
                        }

                        indShow=new boolean[indicators.getLength()];
                        
                        for (int i = 0; i < indicators.getLength(); i++) {
                            indShow[i]=true;
                            Node indicator = indicators.item(i);
                            indName[i] = config.getString("name", indicator);

                            indGroup[i] = config.getNumber("group", indicator);
                            indSplit[i] = config.getString("split", indicator);
                            if (indicatorsSplits.containsKey(indSplit[i]) == false) {
                                ArrayList<Integer> splitInds = new ArrayList<Integer>();
                                splitInds.add(new Integer(i));
                                indicatorsSplits.put(indSplit[i], splitInds);
                                splitsCombobox.addItem(indSplit[i]);
                            } else {
                                ArrayList<Integer> splitInds = indicatorsSplits.get(indSplit[i]);
                                splitInds.add(new Integer(i));
                                indicatorsSplits.put(indSplit[i], splitInds);
                            }
                            indInverted[i] = config.getNumber("inverted", indicator);
                            indType[i] = config.getNumber("type", indicator);
                            indThickness[i] = config.getNumber("thickness", indicator);
                            indLinestyle[i] = config.getNumber("linestyle", indicator);
                            indColor[i] = config.getColor("color", indicator);
                            indColor2[i] = config.getColor("color2", indicator);
                            indSymbolcode[i] = config.getNumber("symbolcode", indicator);
                            indScale[i] = config.getNumber("scale", indicator);
                            indShift[i] = config.getNumber("shift", indicator);
                            Number indLimitsLower = config.getNumber("limits/lower", indicator);
                            Number indLimitsUpper = config.getNumber("limits/upper", indicator);
                            Number indBoundsLower = config.getNumber("bounds/lower", indicator);
                            Number indBoundsUpper = config.getNumber("bounds/upper", indicator);

                            indRendererAnnotations[i] = new ArrayList<XYAnnotation>();
                            indRenderer[i] = getRenderer(indThickness[i].floatValue(), indType[i].intValue(), indColor[i], indColor2[i], indLinestyle[i].intValue(), false);
                            indRenderer[i].setSeriesShape(0, getShape(0));


                            plot.setRenderer(i, indRenderer[i], true);
                            if (indType[i].intValue() == LineType) {
                                if (indRenderer[i] != null) {
                                    ((XYLineAndShapeRenderer) indRenderer[i]).setBaseShapesVisible(false);
                                }
                            }
                            if (indLimitsUpper.doubleValue() > indLimitsLower.doubleValue()) {
                                IntervalMarker mark = new IntervalMarker(indLimitsLower.doubleValue(), indLimitsUpper.doubleValue());
                                mark.setPaint(indColor[i]);
                                mark.setAlpha((float) 0.25);
                                plot.addRangeMarker(0, mark, Layer.FOREGROUND, true);
                            }

                            NumberAxis indValueAxis;
                            NodeList labels = config.getNodes("labels/label", indicator);
                            if (labels.getLength() > 0) {
                                String[] sv = new String[labels.getLength()];
                                for (int svCount = 0; svCount < sv.length; svCount++) {
                                    sv[svCount] = labels.item(svCount).getTextContent();
                                }
                                indValueAxis = new SymbolAxisWithCursor(indName[i], sv);
                            } else {
                                indValueAxis = new NumberAxisWithCursor(indName[i]);
                            }

                            indValueAxis.setAutoRangeIncludesZero(false);
                            if (labels.getLength() > 0) {
                                Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
                                ChartRenderingInfo CRI;
                                PlotRenderingInfo pri;
                                CRI = chartPanel.getChartRenderingInfo();
                                pri = CRI.getPlotInfo();
                                float fontSize = 16;
                                if (pri.getPlotArea()!=null) {
                                    fontSize=((float)pri.getPlotArea().getHeight() - 30) / labels.getLength();
                                    if (fontSize > 16) {
                                        fontSize = 16;
                                    }
                                    indValueAxis.setTickLabelFont(plainFont.deriveFont(fontSize));
                                }
                            } else {
                                indValueAxis.setTickLabelFont(plainFont.deriveFont((float) 10.0));
                            }
                            indValueAxis.setLabelFont(boldFont.deriveFont((float) 8.0));
                            indValueAxis.setInverted(indInverted[i].intValue() == 1);
                            indValueAxis.setAxisLinePaint(indColor[i]);
                            indValueAxis.setLabelPaint(indColor[i]);
                            indValueAxis.setTickLabelPaint(indColor[i]);
                            indValueAxis.setTickMarkPaint(indColor[i]);
                            indValueAxis.setVisible(true);
//                            indValueAxis.setStandardTickUnits(NumberAxis.createStandardTickUnits());
                            indValueAxis.setStandardTickUnits(createCustomTickUnits());
                            Range r = new Range(indBoundsLower.doubleValue(), indBoundsUpper.doubleValue());
                            if (indBoundsLower.doubleValue() == indBoundsUpper.doubleValue()) {
                                indValueAxis.setAutoRange(true);
                            } else {
                                indValueAxis.setAutoRange(false);
                                indValueAxis.setRange(r, true, true);
                            }
                            ValueAxis axis = plot.getRangeAxis(indGroup[i].intValue());
                            if (axis == null) {
                                plot.setRangeAxis(indGroup[i].intValue(), indValueAxis, true);
                                plot.setRangeAxisLocation(indGroup[i].intValue(), AxisLocation.BOTTOM_OR_LEFT, true);
                            } else {
                                if (axis.getLabel().equals("")) {
                                    axis.setLabel(indName[i]);
                                } else {
                                    axis.setLabel(axis.getLabel() + ", " + indName[i]);
                                }
                                axis.setInverted(axis.isInverted() || (indInverted[i].intValue() == 1));
                            }
                            plot.mapDatasetToRangeAxis(i, indGroup[i].intValue());
                        }

                        TextTitle chartTitle = chart.getTitle();
                        chartTitle.setText(config.getString("/trends/panel/title/text"));
                        chartTitle.setFont(boldFont.deriveFont(config.getNumber("/trends/panel/title/fontsize").floatValue()));

                        chart.setBackgroundPaint(config.getColor("/trends/panel/backcolor"));
                        modeButton.setSelected(true);
                        changeMode(true);
                        tt = new TimerTask() {

                            @Override
                            public void run() {
                                if (isRealtime == true) {
                                    BuildChart();
                                }
                                Date dt=new Date();
                                CurrentDatetime.setText(new SimpleDateFormat("dd.MM.yyyy HH:mm:ss").format(dt));
                            }
                        };
                        timer.schedule(tt, 1000, 1000);
                        if (frame != null) {
                            frame.dispose();
                            frame = null;
                        }
                        frame = TrendsFrame.this;
                        setVisible(true);
//                        setAlwaysOnTop(true);
                    }
                });


    }

    private void AlignChartByMinutes(long minutes) {
//        if (isRealtime==false) {
        Timestamp tmp = startTS.clone();
        long mins = Math.round((tmp.getHour() * 60 + tmp.getMinute()) / minutes) * minutes;
        int h = (int) (mins / 60);
        int m = (int) (mins % 60);

        Timestamp tmp2 = new Timestamp(tmp.getYear(), tmp.getMonth(), tmp.getDay(), h, m, 0);
        startTS = tmp2.clone();
        tmp2.AddMinutes(minutes);
        finishTS = tmp2.clone();
        BuildChart();
//        }
    }

    private void AlignChartByShift(long shift) {
        if (isRealtime == false) {
            Timestamp tmp = new Timestamp();
            tmp.SetNow();
            if (shift == 1) {
                tmp.setHour(23);
                tmp.setMinute(0);
                tmp.setSecond(0);
                tmp.AddMinutes(-1440);
            } else if (shift == 2) {
                tmp.setHour(7);
                tmp.setMinute(0);
                tmp.setSecond(0);
            } else if (shift == 3) {
                tmp.setHour(15);
                tmp.setMinute(0);
                tmp.setSecond(0);
            } else if (shift == 0) {
                int currentMinute = tmp.getHour() * 60 + tmp.getMinute();
                if ((currentMinute >= (7 * 60 )) && (currentMinute < (15 * 60))) {
                    AlignChartByShift(2);
                } else if ((currentMinute < (7 * 60 )) || (currentMinute >= (23 * 60 ))) {
                    AlignChartByShift(1);
                } else if ((currentMinute >= (15 * 60 )) && (currentMinute < (23 * 60))) {
                    AlignChartByShift(3);
                }
            } else if (shift == -1) {
                int currentMinute = tmp.getHour() * 60 + tmp.getMinute();
                if ((currentMinute >= (7 * 60 )) && (currentMinute < (15 * 60))) {
                    tmp.setHour(7);
                    tmp.setMinute(0);
                    tmp.setSecond(0);
                    tmp.AddMinutes(-8*60);
                } else if ((currentMinute < (7 * 60 )) || (currentMinute >= (23 * 60 ))) {
                    tmp.setHour(23);
                    tmp.setMinute(0);
                    tmp.setSecond(0);
                    tmp.AddMinutes(-1440-8*60);
                } else if ((currentMinute >= (15 * 60 )) && (currentMinute < (23 * 60))) {
                    tmp.setHour(15);
                    tmp.setMinute(0);
                    tmp.setSecond(0);
                    tmp.AddMinutes(-8*60);
                }
            }
            startTS = tmp.clone();
            tmp.AddMinutes(8 * 60);
            finishTS = tmp.clone();
            BuildChart();
        }
    }

    private void PanChart(long pan) {
        if (isRealtime == false) {
            startTS.AddSeconds(pan);
            finishTS.AddSeconds(pan);
            BuildChart();
        }
    }

    private void BuildChart() {
        BuildChartThreaded();
    }

    private void BuildChartThreaded() {
        try {
            if (busy == false) {
                busy = true;
                TextTitle chartTitle = chart.getTitle();
                if (splitsCombobox.getSelectedItem() != null) {
                    String selectedSplit = splitsCombobox.getSelectedItem().toString();
                    if (config.getString("/trends/panel/title/text").endsWith(".")) {
                        chartTitle.setText(config.getString("/trends/panel/title/text") + " " + selectedSplit);
                    } else {
                        chartTitle.setText(config.getString("/trends/panel/title/text") + ". " + selectedSplit);
                    }
                } else {
                    chartTitle.setText(config.getString("/trends/panel/title/text"));
                }
                plot.setNoDataMessage("Загрузка данных...");
                plot.clearAnnotations();

                if (isRealtime == true) {
                    long dif = startTS.difSeconds(finishTS);
                    Timestamp current_ts = new Timestamp();
                    current_ts.SetNow();
                    finishTS = current_ts.clone();
                    current_ts.AddSeconds(-dif);
                    startTS = current_ts.clone();
                } else {
                    for (int i = 0; i < plot.getDatasetCount(); i++) {
                        plot.setDataset(i, null);
                    }
                }
                double margin = ((double) finishTS.getMilliSeconds() - (double) startTS.getMilliSeconds());
                double left_margin = margin * 0.002;
                double right_margin = margin * 0.002;
                if (isRealtime == true) {
                    right_margin = margin * 0.05;
                }
                Range range = new Range((double) startTS.getMilliSeconds() - left_margin, (double) finishTS.getMilliSeconds() + right_margin);
                ValueAxis timeAxis = plot.getDomainAxis(0);
                timeAxis.setAutoRange(false);
                timeAxis.setRange(range, true, true);
                args.put("start", startTS.toJSON());
                args.put("finish", finishTS.toJSON());


                Main.execute_async3(
                        "get_hex_trends_data",
                        args,
                        new Callback() {

                            @Override
                            public void call(Object param) {
                                if (TrendsFrame.this.isVisible()) {
                                    String bin=(String)((Object[])param)[0];
                                    ByteBuffer dataBytes = TrendsFrame.HexStringTyByteBuffer(bin);
                                    if (!(dataBytes == null)) {
                                        if (dataBytes.remaining() > 0) {
                                            ArrayList<TimeSeries> ind_serie = new ArrayList<TimeSeries>();
                                            int groupOffset = 0;
                                            while (dataBytes.hasRemaining() == true) {
                                                int rowsCount = dataBytes.getInt();
                                                int colsCount = dataBytes.getInt();
                                                if (ind_serie.size() < (groupOffset + colsCount)) {
                                                    for (int i = 0; i < colsCount; i++) {
                                                        ind_serie.add(groupOffset + i, new TimeSeries(indName[groupOffset + i]));
                                                    }
                                                }
                                                for (int rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
                                                    int dayTS = dataBytes.getInt();
                                                    int secondsTS = dataBytes.getInt();
                                                    int second = secondsTS % 100;
                                                    int minute = (secondsTS / 100) % 100;
                                                    int hour = (secondsTS / 10000) % 100;
                                                    int day = dayTS % 100;
                                                    int month = (dayTS / 100) % 100;
                                                    int year = (dayTS / 10000) % 10000;

                                                    Timestamp indDataTS = new Timestamp(year, month, day, hour, minute, second);
                                                    FixedMillisecond timestamp = new FixedMillisecond(indDataTS.getMilliSeconds());
                                                    for (int colIndex = 0; colIndex < colsCount; colIndex++) {
                                                        TimeSeries serie = ind_serie.get(groupOffset + colIndex);
                                                        double indDataValue;
                                                        indDataValue = dataBytes.getDouble() * indScale[groupOffset + colIndex].doubleValue() + indShift[groupOffset + colIndex].doubleValue();
                                                        serie.addOrUpdate(timestamp, indDataValue);
                                                        if ((rowIndex % 2) == 1) {
                                                            if ((indType[groupOffset + colIndex].intValue() == SectionType) || (indType[groupOffset + colIndex].intValue() == TrendlineType)) {
                                                                serie.add(
                                                                        new FixedMillisecond(500 + indDataTS.getMilliSeconds()),
                                                                        null,
                                                                        false);
                                                            }
                                                        }
                                                        ind_serie.set(groupOffset + colIndex, serie);
                                                    }
                                                }
                                                groupOffset = groupOffset + colsCount;
                                            }
                                            for (int i = 0; i < ind_serie.size(); i++) {
                                                Iterator<XYAnnotation> iterator = indRendererAnnotations[i].iterator();
                                                while (iterator.hasNext()) {
                                                    indRenderer[i].removeAnnotation(iterator.next());
                                                }
                                                indRendererAnnotations[i].clear();
                                            }
                                            HashMap<Number, String> axisNames = new HashMap<Number, String>();
                                            for (int i = 0; i < ind_serie.size(); i++) {
                                                TimeSeriesCollection ind_dataset = new TimeSeriesCollection();
                                                ind_dataset.addSeries(ind_serie.get(i));
                                                if (splitsCombobox.getSelectedItem() != null) {
                                                    if (indSplit[i].equals(splitsCombobox.getSelectedItem())) {
                                                        if (axisNames.containsKey(indGroup[i]) == false) {
                                                            axisNames.put(indGroup[i], indName[i]);
                                                        } else {
                                                            String axeName = axisNames.get(indGroup[i]);
                                                            axeName.concat(", " + indName[i]);
                                                            axisNames.put(indGroup[i], axeName);
                                                        }
                                                        if (indShow[i]==true) {
                                                            plot.setDataset(i, ind_dataset);
                                                            BuildNonStandard(i, ind_serie.get(i));
                                                        } else {
                                                            plot.setDataset(i, null);
                                                        }
                                                    } else {
                                                        plot.setDataset(i, null);
                                                    }
                                                } else {
                                                    plot.setDataset(i, null);
                                                }



                                            }
                                            Iterator<Number> iterator = axisNames.keySet().iterator();
                                            while (iterator.hasNext()) {
                                                Number indGroupNumber = iterator.next();
                                                ValueAxis axis = plot.getRangeAxis(indGroupNumber.intValue());
                                                if (axis != null) {
                                                    axis.setLabel(axisNames.get(indGroupNumber));
                                                    if (axis instanceof SymbolAxisWithCursor) {
                                                        String[] labels=((SymbolAxisWithCursor)axis).getSymbols();
                                                        Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
                                                        ChartRenderingInfo CRI;
                                                        PlotRenderingInfo pri;
                                                        CRI = chartPanel.getChartRenderingInfo();
                                                        pri = CRI.getPlotInfo();
                                                        float fontSize = 16;
                                                        if (pri.getPlotArea()!=null) {
                                                            fontSize=((float)pri.getDataArea().getHeight() - 250) / labels.length;
                                                            if (fontSize > 16) {
                                                                fontSize = 16;
                                                            }
                                                            axis.setTickLabelFont(plainFont.deriveFont(fontSize));
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    Point p = MouseInfo.getPointerInfo().getLocation();
                                    ProcessChartMouseMoved(
                                            new ChartMouseEvent(
                                            chart,
                                            new MouseEvent(
                                            chartPanel, 0, 0, 0,
                                            p.x, p.y,
                                            0, false),
                                            null));
                                    plot.setNoDataMessage("Нет данных");
                                    busy = false;
                                }
                            }
                        });
            }
        } catch (Exception ex) {
            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private Stroke getStroke(float width, int linestyle) {
        float pat[];
        switch (linestyle) {
            case SolidLineStyle:
                return (new BasicStroke(width));
            case DottedLineStyle:
                pat = new float[2];
                pat[0] = 2f;
                pat[1] = 2f;
                return (new BasicStroke(width, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_ROUND, 0, pat, 0));
            case DashedLineStyle:
                pat = new float[2];
                pat[0] = 5f;
                pat[1] = 5f;
                return (new BasicStroke(width, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_ROUND, 0, pat, 0));
            case AxisLineStyle:
                pat = new float[4];
                pat[0] = 15f;
                pat[1] = 5f;
                pat[2] = 2f;
                pat[3] = 5f;
                return (new BasicStroke(width, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_ROUND, 0, pat, 0));
            case Axis2LineStyle:
                pat = new float[6];
                pat[0] = 15f;
                pat[1] = 5f;
                pat[2] = 2f;
                pat[3] = 5f;
                pat[4] = 2f;
                pat[5] = 5f;
                return (new BasicStroke(width, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_ROUND, 0, pat, 0));
            default:
                return (new BasicStroke(width));
        }
    }

    public XYItemRenderer getRenderer(float width, int type, Color linecolor, Color linecolor2, int linestyle, boolean showPoints) {
        Color color = linecolor;
        Color color2 = linecolor2;
        XYItemRenderer renderer;
        renderer = new XYLineAndShapeRenderer(true, showPoints);
        switch (type) {
            case LineType:
                renderer = new XYLineAndShapeRenderer(true, showPoints);
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case BarType:
                renderer = new XYBarRenderer(1.0f);
                XYBarRenderer barRenderer = (XYBarRenderer) renderer;
                barRenderer.setDrawBarOutline(true);
                barRenderer.setShadowVisible(false);
                barRenderer.setBarPainter(new StandardXYBarPainter());
                barRenderer.setDrawBarOutline(true);
                barRenderer.setSeriesOutlineStroke(0, getStroke(width, SolidLineStyle));
                barRenderer.setSeriesOutlinePaint(0, color);
                barRenderer.setSeriesPaint(0, color);
                barRenderer.setBaseStroke(getStroke(width, SolidLineStyle));
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case DifferenceType:
                renderer = new XYDifferenceRenderer(color, color2, showPoints);
                renderer.setSeriesPaint(0, Color.BLACK);
                renderer.setSeriesPaint(1, Color.BLACK);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case StepType:
                renderer = new XYStepBiColorRenderer(color, color2);
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case VLineType:
                renderer = new XYLineAndShapeRenderer(false, false);
                ((XYLineAndShapeRenderer) renderer).setDrawSeriesLineAsPath(true);
                break;
            case VZoneType:
                renderer = new XYLineAndShapeRenderer(false, false);
                ((XYLineAndShapeRenderer) renderer).setDrawSeriesLineAsPath(true);
                break;
            case SectionType:
                renderer = new XYLineAndShapeRendererBiColor(true, showPoints);
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case HLineType:
                renderer = new XYLineAndShapeRenderer(false, false);
                ((XYLineAndShapeRenderer) renderer).setDrawSeriesLineAsPath(true);
                break;
            case HZoneType:
                renderer = new XYLineAndShapeRenderer(false, false);
                ((XYLineAndShapeRenderer) renderer).setDrawSeriesLineAsPath(true);
                break;
            case TrendlineType:
                renderer = new XYLineAndShapeRenderer(false, false);
                ((XYLineAndShapeRenderer) renderer).setDrawSeriesLineAsPath(true);
                break;
            case LeftValueMarkType:
                renderer = new XYLineAndShapeRendererBiColor(false, false);
                break;
            case RightValueMarkType:
                renderer = new XYLineAndShapeRendererBiColor(false, false);
                break;
            case SymbolType:
                renderer = new XYLineAndShapeRendererBiColor(false, false);
                break;
            case ProfileType:
                renderer = new XYLineAndShapeRenderer(false, false);
                break;
            case OHLCVType:
                renderer = new CandlestickRenderer();
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
            case DigitalType:
                renderer = new DigitalRenderer(color, color2);
                renderer.setSeriesPaint(0, color);
                renderer.setSeriesPaint(1, color2);
                renderer.setSeriesStroke(0, getStroke(width, linestyle));
                renderer.setSeriesStroke(1, getStroke(width, linestyle));
                break;
        }
        DecimalFormat tooltipFormat1 = new DecimalFormat("#####0.0#####");
        DecimalFormatSymbols tooltipFormatDFS1 = tooltipFormat1.getDecimalFormatSymbols();
        tooltipFormatDFS1.setDecimalSeparator('.');
        tooltipFormat1.setDecimalFormatSymbols(tooltipFormatDFS1);
        renderer.setBaseToolTipGenerator(new StandardXYToolTipGenerator("<html>{0}<br/>Дата и время: <b>{1}</b><br/>Значение: <b>{2}</b></html>", new SimpleDateFormat("dd.MM.yyyy hh:mm"), tooltipFormat1));
        renderer.setBaseToolTipGenerator(null);
        return renderer;
    }

    Shape getShape(int itemsCount) {
        double size;
        if (itemsCount <= 100) {
            size = 6;
        } else if (itemsCount <= 200) {
            size = 5;
        } else if (itemsCount <= 300) {
            size = 4;
        } else if (itemsCount <= 400) {
            size = 3;
        } else {
            size = 2;
        }
        double delta = size / 2.0;
        Shape result = new Ellipse2D.Double(-delta, -delta, size, size);
        return result;
    }

    private TickUnits getTickUnits(int shift) {
        TickUnits units = new TickUnits();
        DateFormat f7 = new MyDateFormat(shift, "HH:mm:ss", "d-MMM-yy");
        DateFormat f8 = new MyDateFormat(shift, "HH:mm", "d-MMM-yy");
        DateFormat f10 = new MyDateFormat(shift, "d-MMM-yy", "MMM-yy");
        DateFormat f11 = new MyDateFormat(shift, "MMM-yy", "MMM-yy");

        units.add(new DateTickUnit(DateTickUnitType.SECOND, 5,
                DateTickUnitType.SECOND, 1, f7));
        units.add(new DateTickUnit(DateTickUnitType.SECOND, 10,
                DateTickUnitType.SECOND, 5, f7));
        units.add(new DateTickUnit(DateTickUnitType.SECOND, 20,
                DateTickUnitType.SECOND, 5, f7));
        units.add(new DateTickUnit(DateTickUnitType.SECOND, 30,
                DateTickUnitType.SECOND, 5, f7));
        units.add(new DateTickUnit(DateTickUnitType.MINUTE, 1,
                DateTickUnitType.SECOND, 30, f7));
        units.add(new DateTickUnit(DateTickUnitType.MINUTE, 5,
                DateTickUnitType.MINUTE, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.MINUTE, 10,
                DateTickUnitType.MINUTE, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.MINUTE, 30,
                DateTickUnitType.MINUTE, 10, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 1,
                DateTickUnitType.MINUTE, 30, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 2,
                DateTickUnitType.MINUTE, 30, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 3,
                DateTickUnitType.MINUTE, 30, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 4,
                DateTickUnitType.HOUR, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 5,
                DateTickUnitType.HOUR, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 6,
                DateTickUnitType.HOUR, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 7,
                DateTickUnitType.HOUR, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 8,
                DateTickUnitType.HOUR, 2, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 9,
                DateTickUnitType.HOUR, 2, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 10,
                DateTickUnitType.HOUR, 2, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 11,
                DateTickUnitType.HOUR, 2, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 12,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 13,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 14,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 15,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 16,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 17,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 18,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 19,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 20,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 21,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 22,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.HOUR, 23,
                DateTickUnitType.HOUR, 4, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 1,
                DateTickUnitType.HOUR, 12, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 2,
                DateTickUnitType.DAY, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 3,
                DateTickUnitType.DAY, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 4,
                DateTickUnitType.DAY, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 5,
                DateTickUnitType.DAY, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 6,
                DateTickUnitType.DAY, 1, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 7,
                DateTickUnitType.DAY, 5, f8));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 14,
                DateTickUnitType.DAY, 7, f10));
        units.add(new DateTickUnit(DateTickUnitType.DAY, 30,
                DateTickUnitType.DAY, 14, f10));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 1,
                DateTickUnitType.DAY, 14, f11));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 2,
                DateTickUnitType.MONTH, 1, f11));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 3,
                DateTickUnitType.MONTH, 1, f11));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 4,
                DateTickUnitType.MONTH, 1, f11));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 5,
                DateTickUnitType.MONTH, 1, f11));
        units.add(new DateTickUnit(DateTickUnitType.MONTH, 6,
                DateTickUnitType.MONTH, 1, f11));
        units.add(new DateTickUnit(DateTickUnitType.YEAR, 1,
                DateTickUnitType.MONTH, 3, f11));
        return units;

    }

    public void BuildNonStandard(int index, TimeSeries serie) {

        float thickness = indThickness[index].intValue();
        Color clr2 = indColor[index];
        int type = indType[index].intValue();
        int linestyle = indLinestyle[index].intValue();
        int symbolcode = indSymbolcode[index].intValue();
        int group = indGroup[index].intValue();

        double x1, y1, x2, y2, x3, y3;
        int j;
        Marker mark;

        Color clr = new Color(clr2.getRGB());
        TickUnitSource tus;
        TickUnitSource tusx;
        String vmark_text;
        XYItemRenderer r;
        r = indRenderer[index];
        tus = this.plot.getRangeAxis(group).getStandardTickUnits();
        tusx = this.plot.getDomainAxis().getStandardTickUnits();
        if (type == VLineType) {
            for (j = 0; j < serie.getItemCount(); j++) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                mark = new ValueMarker(x1);
                mark.setLabel("");
                mark.setPaint(clr);
                mark.setAlpha(1f);
                mark.setStroke(getStroke(thickness, linestyle));
                this.plot.addDomainMarker(mark, Layer.FOREGROUND);
                vmark_text = " " + tusx.getCeilingTickUnit(0).valueToString(x1);
                if (vmark_text != null) {
                    if (!(vmark_text.equals(""))) {
                        XYTextAnnotation vmark = new XYTextAnnotation(vmark_text, x1, this.plot.getRangeAxis().getLowerBound());
                        vmark.setTextAnchor(TextAnchor.TOP_LEFT);
                        vmark.setRotationAnchor(TextAnchor.TOP_LEFT);
                        vmark.setRotationAngle(-Math.PI / 2);
                        vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                        vmark.setPaint(clr);
                        vmark.setToolTipText("<html><b>" + vmark_text + "</b></html>");
                        this.plot.addAnnotation(vmark);
                    }
                }
                y1 = serie.getValue(j).doubleValue();
                vmark_text = tus.getCeilingTickUnit(y1).valueToString(y1) + " ";
                if (vmark_text != null) {
                    if (!(vmark_text.equals(""))) {
                        XYTextAnnotation vmark2 = new XYTextAnnotation(vmark_text, x1, this.plot.getRangeAxis().getUpperBound());
                        vmark2.setTextAnchor(TextAnchor.TOP_RIGHT);
                        vmark2.setRotationAnchor(TextAnchor.TOP_RIGHT);
                        vmark2.setRotationAngle(-Math.PI / 2);
                        vmark2.setFont(boldFont.deriveFont((float) (8 * thickness)));
                        vmark2.setPaint(clr);
                        vmark2.setToolTipText("<html><b>" + vmark_text + "</b></html>");
                        this.plot.addAnnotation(vmark2);
                    }
                }
            }
        } else if (type == VZoneType) {
            for (j = 0; j < ((long) (serie.getItemCount() / 2)) * 2; j = j + 2) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                x2 = (double) serie.getTimePeriod(j + 1).getFirstMillisecond();
                if (x1 > x2) {
                    x3 = x1;
                    x1 = x2;
                    x2 = x3;
                }
                mark = new IntervalMarker(x1, x2);
                mark.setLabel("");
                mark.setPaint(clr);
                mark.setAlpha(0.5f);
                mark.setStroke(getStroke(thickness, linestyle));
                this.plot.addDomainMarker(mark, Layer.FOREGROUND);
                vmark_text = tusx.getCeilingTickUnit(x1).valueToString(x1);
                XYTextAnnotation vmark = new XYTextAnnotation(vmark_text, x1, this.plot.getRangeAxis().getLowerBound());
                vmark.setTextAnchor(TextAnchor.BOTTOM_LEFT);
                vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
                vmark_text = tusx.getCeilingTickUnit(x2).valueToString(x2);
                vmark = new XYTextAnnotation(vmark_text, x2, this.plot.getRangeAxis().getLowerBound());
                vmark.setTextAnchor(TextAnchor.BOTTOM_RIGHT);
                vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
            }
        } else if (type == HLineType) {
            for (j = 0; j < serie.getItemCount(); j++) {
                y1 = serie.getValue(j).doubleValue();
                mark = new ValueMarker(y1);
                mark.setLabel("");
                mark.setPaint(clr);
                mark.setAlpha(1f);
                mark.setStroke(getStroke(thickness, linestyle));
                this.plot.addRangeMarker(mark, Layer.FOREGROUND);
                vmark_text = tus.getCeilingTickUnit(y1).valueToString(y1);
                XYTextAnnotation vmark = new XYTextAnnotation(vmark_text, this.plot.getDomainAxis().getLowerBound(), y1);
                vmark.setTextAnchor(TextAnchor.BOTTOM_LEFT);
                vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
            }
        } else if (type == HZoneType) {
            for (j = 0; j < ((long) (serie.getItemCount() / 2)) * 2; j = j + 2) {
                y1 = serie.getValue(j).doubleValue();
                y2 = serie.getValue(j + 1).doubleValue();
                if (y1 > y2) {
                    y3 = y1;
                    y1 = y2;
                    y2 = y3;
                }
                mark = new IntervalMarker(y1, y2);
                mark.setLabel("");
                mark.setPaint(clr);
                mark.setAlpha(0.5f);
                mark.setStroke(getStroke(thickness, linestyle));
                this.plot.addRangeMarker(mark, Layer.FOREGROUND);
                vmark_text = tus.getCeilingTickUnit(y1).valueToString(y1);
                XYTextAnnotation vmark = new XYTextAnnotation(vmark_text, this.plot.getDomainAxis().getLowerBound(), y1);
                vmark.setTextAnchor(TextAnchor.BOTTOM_LEFT);
                vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
                vmark_text = tus.getCeilingTickUnit(y2).valueToString(y2);
                vmark = new XYTextAnnotation(vmark_text, this.plot.getDomainAxis().getLowerBound(), y2);
                vmark.setTextAnchor(TextAnchor.TOP_LEFT);
                vmark.setFont(boldFont.deriveFont((float) (8 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
            }
        } else if (type == TrendlineType) {
            for (j = 0; j < ((long) (serie.getItemCount() / 2)) * 2; j = j + 2) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                x2 = (double) serie.getTimePeriod(j + 1).getFirstMillisecond();
                y1 = serie.getValue(j).doubleValue();
                y2 = serie.getValue(j + 1).doubleValue();
                x3 = 0;
                y3 = 0;
                if (x1 < x2) {
                    x3 = this.plot.getDomainAxis().getUpperBound();
                    y3 = (x3 - x1) / (x2 - x1) * (y2 - y1) + y1;
                } else if (x1 > x2) {
                    x3 = this.plot.getDomainAxis().getLowerBound();
                    y3 = (x3 - x1) / (x2 - x1) * (y2 - y1) + y1;
                }
                if (x1 == x2) {
                    x3 = x1;
                    if (y1 < y2) {
                        y3 = this.plot.getRangeAxis().getUpperBound();
                    } else {
                        y3 = this.plot.getRangeAxis().getLowerBound();
                    }
                }
                clr = new Color(clr.getRGB());
                XYLineAnnotation trend = new XYLineAnnotation(x1, y1, x2, y2, getStroke(thickness, SolidLineStyle), clr);
                this.plot.addAnnotation(trend);
                XYLineAnnotation trend2 = new XYLineAnnotation(x2, y2, x3, y3, getStroke(thickness, DashedLineStyle), clr);
                this.plot.addAnnotation(trend2);
            }
        } else if (type == LeftValueMarkType) {
            for (j = 0; j < serie.getItemCount(); j++) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                y1 = serie.getValue(j).doubleValue();
                vmark_text = tus.getCeilingTickUnit(y1).valueToString(y1);
                XYPointerAnnotation vmark = new XYPointerAnnotation(vmark_text, x1, y1, Math.PI);
                vmark.setArrowPaint(clr);
                vmark.setArrowStroke(getStroke(thickness, linestyle));
                vmark.setTextAnchor(TextAnchor.CENTER_RIGHT);
                vmark.setTipRadius(0);
                r.addAnnotation(vmark, Layer.FOREGROUND);
                indRendererAnnotations[index].add(vmark);
            }
        } else if (type == RightValueMarkType) {

            for (j = 0; j < serie.getItemCount(); j++) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                y1 = serie.getValue(j).doubleValue();
                vmark_text = tus.getCeilingTickUnit(y1).valueToString(y1);
                XYPointerAnnotation vmark = new XYPointerAnnotation(vmark_text, x1, y1, 0);
                vmark.setArrowPaint(clr);
                vmark.setArrowStroke(getStroke(thickness, linestyle));
                vmark.setTextAnchor(TextAnchor.CENTER_LEFT);
                vmark.setTipRadius(0);
                r.addAnnotation(vmark, Layer.FOREGROUND);
                indRendererAnnotations[index].add(vmark);
            }
        } else if (type == SymbolType) {
            for (j = 0; j < serie.getItemCount(); j++) {
                x1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                y1 = serie.getValue(j).doubleValue();
                vmark_text = String.format("%c", symbolcode);
                XYTextAnnotation vmark = new XYTextAnnotation(vmark_text, x1, y1);
                vmark.setTextAnchor(TextAnchor.CENTER);
                vmark.setFont(symbolsFont.deriveFont((float) (12 * thickness)));
                vmark.setPaint(clr);
                this.plot.addAnnotation(vmark);
            }
        } else if (type == ProfileType) {
            double maxValue = 0;
            for (j = 0; j < serie.getItemCount(); j++) {
                x1 = (double) serie.getValue(j).doubleValue();
                if (x1 > maxValue) {
                    maxValue = x1;
                }
            }
            if (maxValue != 0) {
                x1 = (double) startTS.getMilliSeconds();
                x2 = (double) finishTS.getMilliSeconds();
                double difX = (x2 - x1) * 0.25;
                Stroke stroke = getStroke(indThickness[index].floatValue(), indLinestyle[index].intValue());
                for (j = 0; j < serie.getItemCount(); j++) {
                    x2 = (double) serie.getValue(j).doubleValue();
                    x2 = x1 + x2 / maxValue * difX;
                    y1 = (double) serie.getTimePeriod(j).getFirstMillisecond();
                    if (j < (serie.getItemCount() - 1)) {
                        y2 = (double) serie.getTimePeriod(j + 1).getFirstMillisecond();
                    } else {
                        y2 = (double) serie.getTimePeriod(j - 1).getFirstMillisecond();
                    }
                    XYBoxAnnotation itemBox = new XYBoxAnnotation(
                            x1, y1,
                            x2, y2,
                            stroke,
                            Color.BLACK,
                            indColor[index]);
                    r.addAnnotation(itemBox, Layer.FOREGROUND);
                    indRendererAnnotations[index].add(itemBox);
                }
            }
        }
    }

    private void ProcessChartMouseMoved(ChartMouseEvent arg0) {
        int i;
        int x;
        int y;
        double xPos;
        double xPos2;
        double xPos3;
        double yPos;
        double yPos2;

        Point p;
        ChartRenderingInfo CRI;
        PlotRenderingInfo pri;
        HashMap<Long,Long> usedLevels;

        try {

            p = arg0.getTrigger().getPoint();

            DateFormat df = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
            CRI = this.chartPanel.getChartRenderingInfo();
            pri = CRI.getPlotInfo();
            if (isRealtime == true) {
                x = (int) plot.getDomainAxis(0).valueToJava2D((double) finishTS.getMilliSeconds(), pri.getDataArea(), RectangleEdge.BOTTOM);
                y = (int) plot.getRangeAxis(0).valueToJava2D(plot.getRangeAxis(0).getRange().getLowerBound(), pri.getDataArea(), RectangleEdge.LEFT);
            } else {
                x = (int) this.chartPanel.translateScreenToJava2D(p).getX();
                y = (int) this.chartPanel.translateScreenToJava2D(p).getY();
            }

            xPos = plot.getDomainAxis(0).java2DToValue(x, pri.getDataArea(), RectangleEdge.BOTTOM);
            xPos2 = plot.getDomainAxis(0).java2DToValue(x-100, pri.getDataArea(), RectangleEdge.BOTTOM);
            yPos = plot.getRangeAxis(0).java2DToValue(y, pri.getDataArea(), RectangleEdge.LEFT);
            for (i = 0; i < plot.getRangeAxisCount(); i++) {
                NumberAxis rangeAxis = (NumberAxis) plot.getRangeAxis(i);
                if (rangeAxis != null) {
                    double yPosi = rangeAxis.java2DToValue(y, pri.getDataArea(), RectangleEdge.LEFT);
                    if (rangeAxis instanceof NumberAxisWithCursor) {
                        ((NumberAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                    } else if (rangeAxis instanceof SymbolAxisWithCursor) {
                        ((SymbolAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                    }

                }
            }

            for (i = 0; i < plot.getDomainAxisCount(); i++) {
                double xPosi = plot.getDomainAxis(i).java2DToValue(x, pri.getDataArea(), RectangleEdge.BOTTOM);
                ((DateAxisWithCursor) plot.getDomainAxis(i)).setCursorValue(xPosi, false);

            }

            plot.setDomainCrosshairValue(xPos, false);
            plot.setRangeCrosshairValue(yPos, false);
            plot.notifyListeners(new PlotChangeEvent(plot));
            if (showCursorValues == true) {
                
                double value2;
                TimeSeriesDataItem item;
                int indx;
                String timevalue;
                String value_str = "";
                DecimalFormat vf = new DecimalFormat("####0.0#####");
                DecimalFormatSymbols dfs5 = vf.getDecimalFormatSymbols();
                dfs5.setDecimalSeparator('.');
                vf.setDecimalFormatSymbols(dfs5);
                DecimalFormat vf2 = new DecimalFormat("####0");
                DecimalFormatSymbols dfs6 = vf2.getDecimalFormatSymbols();
                dfs6.setDecimalSeparator('.');
                vf2.setDecimalFormatSymbols(dfs6);
                Timestamp ts = new Timestamp((long) xPos);
                FixedMillisecond index = new FixedMillisecond(ts.getMilliSeconds());
                usedLevels=new HashMap<Long, Long>();
                if (pri != null) {
                    if (pri.getPlotArea() != null) {
                        for (int j = 0; j < indName.length; j++) {
                            switch (indType[j].intValue()) {
                                case OHLCVType:
                                    break;
                                case ProfileType:
                                    value_str = "";
                                    break;
                                default:
                                    TimeSeriesCollection dataset3 = (TimeSeriesCollection) plot.getDataset(j);
                                    if (dataset3 != null) {
                                        TimeSeries series3 = dataset3.getSeries(0);
                                        value2 = 0;
                                        indx = series3.getIndex(index);
                                        if (indx < 0) {
                                            indx++;
                                            indx = -1 * indx;
                                            try {
                                                if (indx == 0) {
                                                    item = series3.getDataItem(indx);
                                                    ts = new Timestamp(item.getPeriod().getFirstMillisecond());
                                                    value2 = item.getValue().doubleValue();
                                                } else if (indx == series3.getItemCount()) {
                                                    item = series3.getDataItem(indx - 1);
                                                    ts = new Timestamp(item.getPeriod().getFirstMillisecond());
                                                    value2 = item.getValue().doubleValue();
                                                } else {
                                                    item = series3.getDataItem(indx - 1);
                                                    ts = new Timestamp(item.getPeriod().getFirstMillisecond());
                                                    value2 = item.getValue().doubleValue();
                                                }
                                            } catch (Exception ee) {
                                                System.out.println(ee);
                                            }
                                        } else {
                                            item = series3.getDataItem(indx);
                                            if (item.getValue() != null) {
                                                ts = new Timestamp(item.getPeriod().getFirstMillisecond());
                                                value2 = item.getValue().doubleValue();
                                            }
                                        }
                                        timevalue = df.format(ts.getCalendar().getTime()).toString();
                                        NumberAxis rangeAxis = (NumberAxis) plot.getRangeAxis(indGroup[j].intValue());
                                        if (rangeAxis instanceof NumberAxisWithCursor) {
                                            value_str = rangeAxis.getTickUnit().valueToString(value2);
                                        } else if (rangeAxis instanceof SymbolAxisWithCursor) {
                                            value_str = ((SymbolAxisWithCursor) rangeAxis).valueToString(value2);
                                        }
                                        if (indShow[j]==true) {
                                            if (indCursorValue[j]==null) {
                                                indCursorValue[j] = new XYTextAnnotation(" ", 0, 0);
                                                indCursorValue[j].setTextAnchor(TextAnchor.BOTTOM_RIGHT);
                                                indCursorValue[j].setRotationAnchor(TextAnchor.BOTTOM_RIGHT);
                                                indCursorValue[j].setRotationAngle(0.0);
//                                                indCursorValue[j].setFont(boldFont.deriveFont((float) 16.0));
                                                indCursorValue[j].setFont(checkFont(plot.getRangeAxis(indGroup[j].intValue()).getTickLabelFont()));
                                                indCursorValue[j].setPaint((indColor[j].getRed() < 128) && (indColor[j].getGreen() < 128) && (indColor[j].getBlue() < 128) ? Color.white : Color.black);
                                                indCursorValue[j].setOutlinePaint(indColor[j].darker().darker());
                                                indCursorValue[j].setOutlineStroke(new BasicStroke(2));
                                                indCursorValue[j].setOutlineVisible(true);
                                                indCursorValue[j].setBackgroundPaint(indColor[j]);
                                                indCursorValue[j].setToolTipText("<html><b></b></html>");
                                                indRenderer[j].addAnnotation(indCursorValue[j], Layer.FOREGROUND);
                                            }
                                            indCursorValue[j].setText("".equals(indName[j]) ? value_str : indName[j] + ": " + value_str);
                                            ValueAxis axis = plot.getRangeAxis(indGroup[j].intValue());
                                            FontMetrics metrics = chartPanel.getFontMetrics(indCursorValue[j].getFont());
                                            long adv = metrics.stringWidth(indCursorValue[j].getText());
                                            long adv2 = metrics.getHeight();
                                            java.awt.geom.Rectangle2D r = CRI.getPlotInfo().getDataArea();
                                            if ((x - adv - 2) >= r.getX()) {
                                                xPos3=xPos2;
                                                indCursorValue[j].setTextAnchor(TextAnchor.BOTTOM_RIGHT);
                                            } else {
                                                xPos3=xPos+Math.abs(xPos-xPos2);
                                                indCursorValue[j].setTextAnchor(TextAnchor.BOTTOM_LEFT);
                                            }
                                            indCursorValue[j].setX(xPos3);
                                            if (axis==null) {
                                                indCursorValue[j].setY(value2);
                                                if (indCursorValueLine[j]!=null) {
                                                    indRenderer[j].removeAnnotation(indCursorValueLine[j]);
                                                    indCursorValueLine[j]=null;
                                                }
                                                indCursorValueLine[j] = new XYLineAnnotation(xPos, value2, xPos3, value2,getStroke(1,DashedLineStyle),indColor[j]);
                                                indCursorValueLine[j].setToolTipText("<html><b>" + value_str + "</b></html>");
                                                indRenderer[j].addAnnotation(indCursorValueLine[j], Layer.FOREGROUND);
                                            } else {
                                                long plotHeight=(long)pri.getPlotArea().getHeight();
                                                long maxLevels=plotHeight/adv2-1;
                                                long currentLevel=(long) (Math.floor((value2-axis.getLowerBound())/axis.getRange().getLength()*maxLevels));
                                                long checkLevel=currentLevel+1;
                                                while (usedLevels.containsKey(new Long(checkLevel))==true) {
                                                    checkLevel++;
                                                }
                                                if (checkLevel>=maxLevels) {
                                                    checkLevel=maxLevels;
                                                }
                                                usedLevels.put(new Long(checkLevel),new Long(1));
                                                yPos2=axis.getRange().getLength()*((double)checkLevel/(double)maxLevels)+axis.getLowerBound();
                                                indCursorValue[j].setY(yPos2);
                                                if (indCursorValueLine[j]!=null) {
                                                    indRenderer[j].removeAnnotation(indCursorValueLine[j]);
                                                    indCursorValueLine[j]=null;
                                                }
                                                indCursorValueLine[j] = new XYLineAnnotation(xPos, value2, xPos3, yPos2,getStroke(1,DashedLineStyle),indColor[j]);
                                                indCursorValueLine[j].setToolTipText("<html><b>" + value_str + "</b></html>");
                                                indRenderer[j].addAnnotation(indCursorValueLine[j], Layer.FOREGROUND);
                                            }
                                            indCursorValue[j].setToolTipText("<html><b>" + value_str + "</b></html>");
                                            if (indRenderer[j] instanceof DigitalRenderer) {
                                                if ((Math.round(value2) % 2) == 0) {
                                                    indCursorValue[j].setBackgroundPaint(((DigitalRenderer) indRenderer[j]).getColor1());
                                                } else {
                                                    indCursorValue[j].setBackgroundPaint(((DigitalRenderer) indRenderer[j]).getColor2());
                                                }
                                            }
                                            
                                        } else {
                                            indRenderer[j].removeAnnotation(indCursorValue[j]);
                                            indCursorValue[j]=null;
                                            indRenderer[j].removeAnnotation(indCursorValueLine[j]);
                                            indCursorValueLine[j]=null;
                                        }
                                        
                                    } else {
                                        indRenderer[j].removeAnnotation(indCursorValue[j]);
                                        indCursorValue[j]=null;
                                        indRenderer[j].removeAnnotation(indCursorValueLine[j]);
                                        indCursorValueLine[j]=null;
                                    }
                                    break;
                            }
                        }
                    }
                }
            } else {
                for (i = 0; i < indCursorValue.length; i++) {
                    indRenderer[i].removeAnnotation(indCursorValue[i]);
                    indCursorValue[i]=null;
                    indRenderer[i].removeAnnotation(indCursorValueLine[i]);
                    indCursorValueLine[i]=null;
                }
            }
        } catch (Exception exp) {
        }
    }

    private Font getFont(String fontFilename, float fontSize) {

        Font font = null;
        try {
            font = Font.createFont(Font.TRUETYPE_FONT, getClass().getResourceAsStream("resources/" + fontFilename));
        } catch (FontFormatException ex) {
            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
        }
        return font.deriveFont((float) fontSize);
    }

    private Icon getIcon(String key) {
        try {
            try {
                return new ImageIcon(TrendsFrame.class.getResource("resources/" + bundle.getString(key)).toURI().toURL());
            } catch (MalformedURLException ex) {
                Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
        } catch (URISyntaxException ex) {
            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }

    private JToggleButton createToggleButton(String text, String tooltipText, String iconKey, String selectedIconKey, boolean initialSelection, ActionListener action) {
        JToggleButton b = new JToggleButton();
        b.setIcon(getIcon(iconKey));
        b.setText(text);
        b.setToolTipText(tooltipText);
        b.setDoubleBuffered(true);
        b.setFocusable(false);
        b.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
        b.setMaximumSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setMinimumSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setPreferredSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setSelectedIcon(getIcon(selectedIconKey));
        b.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        b.setSelected(initialSelection);
        b.addActionListener(action);
        return b;
    }

    private JButton createButton(String text, String tooltipText, String iconKey, ActionListener action) {
        JButton b = new JButton();
        b.setIcon(getIcon(iconKey));
        b.setText(text);
        b.setToolTipText(tooltipText);
        b.setDoubleBuffered(true);
        b.setFocusable(false);
        b.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
        b.setMaximumSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setMinimumSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setPreferredSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        b.addActionListener(action);
        return b;
    }

    private JButton createTextButton(String text, String tooltipText, ActionListener action) {
        JButton b = new JButton();
        b.setText(text);
        b.setToolTipText(tooltipText);
        b.setDoubleBuffered(true);
        b.setFocusable(false);
        b.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
        b.setMaximumSize(new java.awt.Dimension(65535, 32*size.height/1200));
        b.setMinimumSize(new java.awt.Dimension(32*size.width/1920, 32*size.height/1200));
        b.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        b.addActionListener(action);
        return b;
    }

    private void allDone() {
        tt.cancel();
        frame.dispose();
        frame = null;
    }

    public static void show( String data) throws JSONException, MalformedURLException, URISyntaxException, InterruptedException {
        show(data, null, null);
    }

    public static void show( final String data, final Object menuObj, final Scriptable paramsObj) throws JSONException, MalformedURLException, URISyntaxException, InterruptedException {
        Thread thread=new Thread() {
            @Override
            public void run() {
                menu = getMenu(menuObj, menuObj,paramsObj ).getPopupMenu();
                System.setProperty("sun.java2D.opengl", "True");
                System.out.println("Opening trends:" + "\n" + data);
                TrendsFrame newframe = new TrendsFrame();
                try {
                    newframe.initTrendsFrame( data);
                } catch (MalformedURLException ex) {
                    Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                } catch (JSONException ex) {
                    Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                } catch (URISyntaxException ex) {
                    Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                } catch (InterruptedException ex) {
                    Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                }

            }
        };
        thread.start();
    }

    private static JMenu getMenu( final Object menuObj, final Object mainMenu,final Scriptable paramsObj ) {
        JMenu localMenu = new JMenu();
        if (menuObj != null) {
            if (menuObj instanceof NativeArray) {
                NativeArray arr = (NativeArray) menuObj;
                for (int i = 0; i < arr.getLength(); i++) {
                    NativeObject elem = (NativeObject) arr.get(i, null);
                    String menuItemText = (String) NativeObject.getProperty(elem, "text");
                    Object submenuObj = NativeObject.getProperty(elem, "submenu");
                    if (submenuObj instanceof NativeArray) {
                        JMenu submenu = getMenu((NativeArray) submenuObj, mainMenu,paramsObj );
                        submenu.setText(menuItemText);
                        localMenu.add(submenu);
                    } else {
                        final String menuItemId = (String) NativeObject.getProperty(elem, "id");
                        JMenuItem item = new JMenuItem(menuItemText);
                        item.addActionListener(
                                new ActionListener() {

                                    @Override
                                    public void actionPerformed(ActionEvent e) {
                                        try {
                                            Object params = NativeObject.getProperty((Scriptable) paramsObj, menuItemId);
                                            String jsonParams = ((String) params).toString();
                                            TrendsFrame.show( "{template:'trends',data:'trends',args:" + jsonParams + "}", mainMenu, paramsObj);
                                        } catch (JSONException ex) {
                                            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                                        } catch (MalformedURLException ex) {
                                            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                                        } catch (URISyntaxException ex) {
                                            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                                        } catch (InterruptedException ex) {
                                            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
                                        }
                                    }
                                });
                        localMenu.add(item);
                    }
                }
            }
        }
        return localMenu;
    }

    public static void main(String[] args) {
    }

    private String formatColor(int color) {
        int b = color & 0x0000ff;
        int g = (color & 0x00ff00) >> 8;
        int r = (color & 0xff0000) >> 16;
        return "rgb(" + String.valueOf(r) + "," + String.valueOf(g) + "," + String.valueOf(b) + ")";
    }

    public void changeMode(boolean mode) {
        isRealtime = mode;
        if (isRealtime == true) {
            if (startTS.difSeconds(finishTS) > 86400) {
                startTS = finishTS.clone();
                startTS.AddSeconds(-86400);
            }
        }
        BuildChart();
        chartPanel.setDomainZoomable(!(isRealtime));
        chartPanel.setRangeZoomable(!(isRealtime));
    }

    private void saveAsPDF(StringBuffer eventsText) {
        String fname;
        int i;

        plot.setDomainCrosshairVisible(false);
        plot.setRangeCrosshairVisible(false);
        for (i = 0; i < plot.getRangeAxisCount(); i++) {
            ValueAxis rangeAxis = plot.getRangeAxis(i);
            if (rangeAxis != null) {
                double yPosi = rangeAxis.getLowerBound() - 1;
                if (rangeAxis instanceof NumberAxisWithCursor) {
                    ((NumberAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                } else if (rangeAxis instanceof SymbolAxisWithCursor) {
                    ((SymbolAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                }
            }
        }

        for (i = 0; i < plot.getDomainAxisCount(); i++) {
            double xPosi = plot.getDomainAxis(i).getLowerBound() - 1;
            ((DateAxisWithCursor) plot.getDomainAxis(i)).setCursorValue(xPosi, false);

        }
        fname = config.getString("/trends/panel/title/text");
        if (splitsCombobox.getSelectedItem() != null) {
            String selectedSplit = splitsCombobox.getSelectedItem().toString();
            if (config.getString("/trends/panel/title/text").endsWith(".")) {
                fname = fname + " " + selectedSplit;
            } else {
                fname = fname + ". " + selectedSplit;
            }
        }
        fname = fname + "," + startTS.toString() + "," + finishTS.toString();
        fname = fname.replace(".", "-");
        fname = fname.replace(":", "-");
        fname = fname.replace(" ", "-");
        fname = fname + ".pdf";
        File outputdir = new File(System.getProperty("user.home") + "\\Графики\\");
        outputdir.mkdirs();
        ChartRenderingInfo CRI = chartPanel.getChartRenderingInfo();
        java.awt.Rectangle r = CRI.getChartArea().getBounds();
        com.lowagie.text.Rectangle pagesize = new com.lowagie.text.Rectangle(r.height, r.width);
        ChartPrinter.saveAsPDF2(
                System.getProperty("user.home") + "\\Графики\\" + fname,
                pagesize,
                chart,
                eventsText);

        Point p;
        p = MouseInfo.getPointerInfo().getLocation();
        CRI = chartPanel.getChartRenderingInfo();
        int x = (int) chartPanel.translateScreenToJava2D(p).getX();
        int y = (int) chartPanel.translateScreenToJava2D(p).getY();
        PlotRenderingInfo pri = CRI.getPlotInfo();

        for (i = 0; i < plot.getRangeAxisCount(); i++) {
            ValueAxis rangeAxis = plot.getRangeAxis(i);
            if (rangeAxis != null) {
                double yPosi = rangeAxis.java2DToValue(y, pri.getDataArea(), RectangleEdge.LEFT);
                if (rangeAxis instanceof NumberAxisWithCursor) {
                    ((NumberAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                } else if (rangeAxis instanceof SymbolAxisWithCursor) {
                    ((SymbolAxisWithCursor) rangeAxis).setCursorValue(yPosi, false);
                }
            }
        }

        for (i = 0; i < plot.getDomainAxisCount(); i++) {
            double xPosi = plot.getDomainAxis(i).java2DToValue(x, pri.getDataArea(), RectangleEdge.BOTTOM);
            ((DateAxisWithCursor) plot.getDomainAxis(i)).setCursorValue(xPosi, false);

        }
        plot.setDomainCrosshairVisible(true);
        plot.setRangeCrosshairVisible(true);
        JOptionPane.showMessageDialog(TrendsFrame.this, "Графики сохранены в файл " + System.getProperty("user.home") + "\\Графики\\" + fname, "Сохранение графиков", JOptionPane.INFORMATION_MESSAGE);
    }
    
    private static ByteBuffer HexStringTyByteBuffer(String str) {
        byte[] bytes;
        bytes=new byte[str.length()/2];
        for (int i=0; i<str.length(); i=i+2) {
            bytes[i/2]=(byte) (HalfByteToValue(str.substring(i,i+1))*16+HalfByteToValue(str.substring(i+1,i+2)));
        }
        return ByteBuffer.wrap(bytes);
        
    }
    
    private static byte HalfByteToValue(String str) {
        if ("0".equals(str)) {
            return 0;
        } else if ("1".equals(str)) {
            return 1;
        } else if ("2".equals(str)) {
            return 2;
        } else if ("3".equals(str)) {
            return 3;
        } else if ("4".equals(str)) {
            return 4;
        } else if ("5".equals(str)) {
            return 5;
        } else if ("6".equals(str)) {
            return 6;
        } else if ("7".equals(str)) {
            return 7;
        } else if ("8".equals(str)) {
            return 8;
        } else if ("9".equals(str)) {
            return 9;
        } else if ("A".equals(str)) {
            return 10;
        } else if ("B".equals(str)) {
            return 11;
        } else if ("C".equals(str)) {
            return 12;
        } else if ("D".equals(str)) {
            return 13;
        } else if ("E".equals(str)) {
            return 14;
        } else if ("F".equals(str)) {
            return 15;
        }
        return 0;
    }
    
    public void dispose() {
        chart = null;
        chartPanel = null;
        plot = null;
        config = null;
        finishTS = null;
        startTS = null;
        args = null;
        indName = null;
        indGroup = null;
        indInverted = null;
        indType = null;
        indThickness = null;
        indLinestyle = null;
        indColor = null;
        indColor2 = null;
        indSymbolcode = null;
        indScale = null;
        indShift = null;
        indSplit = null;
        indShow = null;
        indicatorsSplits = null;
        indCursorValue = null;
        indRenderer = null;
        indRendererAnnotations = null;
        timescale = null;
        symbolsFont = null;
        plainFont = null;
        boldFont = null;
        dataValues = null;
        splitsCombobox = null;
        CurrentDatetime=null;
        super.dispose();
    }
    
    private static TickUnitSource createCustomTickUnits() {

        TickUnits units = new TickUnits();
        DecimalFormat df0 = new DecimalFormat("0.000");
        DecimalFormat df1 = new DecimalFormat("0.000");
        DecimalFormat df2 = new DecimalFormat("0.000");
        DecimalFormat df3 = new DecimalFormat("0.000");
        DecimalFormat df4 = new DecimalFormat("0.000");
        DecimalFormat df5 = new DecimalFormat("0.000");
        DecimalFormat df6 = new DecimalFormat("0.000");
        DecimalFormat df7 = new DecimalFormat("0.000");
        DecimalFormat df8 = new DecimalFormat("#,##0.000");
        DecimalFormat df9 = new DecimalFormat("#,###,##0.000");
        DecimalFormat df10 = new DecimalFormat("#,###,###,##0.000");

        // we can add the units in any order, the TickUnits collection will
        // sort them...
        units.add(new NumberTickUnit(0.0000001, df1, 2));
        units.add(new NumberTickUnit(0.000001, df2, 2));
        units.add(new NumberTickUnit(0.00001, df3, 2));
        units.add(new NumberTickUnit(0.0001, df4, 2));
        units.add(new NumberTickUnit(0.001, df5, 2));
        units.add(new NumberTickUnit(0.01, df6, 2));
        units.add(new NumberTickUnit(0.1, df7, 2));
        units.add(new NumberTickUnit(1, df8, 2));
        units.add(new NumberTickUnit(10, df8, 2));
        units.add(new NumberTickUnit(100, df8, 2));
        units.add(new NumberTickUnit(1000, df8, 2));
        units.add(new NumberTickUnit(10000, df8, 2));
        units.add(new NumberTickUnit(100000, df8, 2));
        units.add(new NumberTickUnit(1000000, df9, 2));
        units.add(new NumberTickUnit(10000000, df9, 2));
        units.add(new NumberTickUnit(100000000, df9, 2));
        units.add(new NumberTickUnit(1000000000, df10, 2));
        units.add(new NumberTickUnit(10000000000.0, df10, 2));
        units.add(new NumberTickUnit(100000000000.0, df10, 2));

        units.add(new NumberTickUnit(0.00000025, df0, 5));
        units.add(new NumberTickUnit(0.0000025, df1, 5));
        units.add(new NumberTickUnit(0.000025, df2, 5));
        units.add(new NumberTickUnit(0.00025, df3, 5));
        units.add(new NumberTickUnit(0.0025, df4, 5));
        units.add(new NumberTickUnit(0.025, df5, 5));
        units.add(new NumberTickUnit(0.25, df6, 5));
        units.add(new NumberTickUnit(2.5, df7, 5));
        units.add(new NumberTickUnit(25, df8, 5));
        units.add(new NumberTickUnit(250, df8, 5));
        units.add(new NumberTickUnit(2500, df8, 5));
        units.add(new NumberTickUnit(25000, df8, 5));
        units.add(new NumberTickUnit(250000, df8, 5));
        units.add(new NumberTickUnit(2500000, df9, 5));
        units.add(new NumberTickUnit(25000000, df9, 5));
        units.add(new NumberTickUnit(250000000, df9, 5));
        units.add(new NumberTickUnit(2500000000.0, df10, 5));
        units.add(new NumberTickUnit(25000000000.0, df10, 5));
        units.add(new NumberTickUnit(250000000000.0, df10, 5));

        units.add(new NumberTickUnit(0.0000005, df1, 5));
        units.add(new NumberTickUnit(0.000005, df2, 5));
        units.add(new NumberTickUnit(0.00005, df3, 5));
        units.add(new NumberTickUnit(0.0005, df4, 5));
        units.add(new NumberTickUnit(0.005, df5, 5));
        units.add(new NumberTickUnit(0.05, df6, 5));
        units.add(new NumberTickUnit(0.5, df7, 5));
        units.add(new NumberTickUnit(5L, df8, 5));
        units.add(new NumberTickUnit(50L, df8, 5));
        units.add(new NumberTickUnit(500L, df8, 5));
        units.add(new NumberTickUnit(5000L, df8, 5));
        units.add(new NumberTickUnit(50000L, df8, 5));
        units.add(new NumberTickUnit(500000L, df8, 5));
        units.add(new NumberTickUnit(5000000L, df9, 5));
        units.add(new NumberTickUnit(50000000L, df9, 5));
        units.add(new NumberTickUnit(500000000L, df9, 5));
        units.add(new NumberTickUnit(5000000000L, df10, 5));
        units.add(new NumberTickUnit(50000000000L, df10, 5));
        units.add(new NumberTickUnit(500000000000L, df10, 5));

        return units;

    }
    
    private Font checkFont(Font font) {
        float fontSize=(float)font.getSize();
        fontSize=fontSize*2;
        if (fontSize<6) {
            fontSize=6;
        }
        float maxSize=(chartPanel.getHeight()-100)/(indCursorValue.length==0 ? 1 : indCursorValue.length);
        if (fontSize>maxSize) {
            fontSize=maxSize;
        }
        return font.deriveFont(fontSize);
    }
}