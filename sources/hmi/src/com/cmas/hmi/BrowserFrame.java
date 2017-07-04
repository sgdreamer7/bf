/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

/**save
 *
 * @author vns
 */
import com.Ostermiller.util.PasswordDialog;
import com.lowagie.text.DocumentException;
import java.awt.*;
import java.awt.event.*;
import java.awt.print.PrinterException;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.xhtmlrenderer.simple.FSScrollPane;
import org.xhtmlrenderer.swing.ScalableXHTMLPanel;
import static org.apache.commons.lang3.StringEscapeUtils.escapeHtml4;
        
public class BrowserFrame extends JFrame {

    protected static ResourceBundle bundle;
    protected static BrowserFrame frame;
    protected static ScalableXHTMLPanel view;
    protected static String lastData;
    protected static JPopupMenu menu=null;
    protected static Calendar date1=new GregorianCalendar();
    protected static Calendar date2=new GregorianCalendar();
    protected static JButton date1Button=null;
    protected static JButton date2Button=null;
    protected static JButton menuButton=null;
    protected static JButton printButton=null;
    protected static JButton saveButton=null;
    protected static JButton refreshButton=null;
    
    static {
        bundle = ResourceBundle.getBundle("com.cmas.hmi.resources.TrendsView", Locale.getDefault());
        System.setProperty("sun.java2D.opengl","True");
        System.setProperty("java.protocol.handler.pkgs", "org.xhtmlrenderer.protocols");
        frame = new BrowserFrame("");
        frame.setVisible(false);
    }
    
    

    public BrowserFrame(final String url) {

        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                BrowserFrame.this.dispose();

            }
        });

        this.getRootPane().registerKeyboardAction(
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                     BrowserFrame.this.dispose();
                }
            },
            KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0),
            JComponent.WHEN_IN_FOCUSED_WINDOW
        );
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
                        Dimension size=new Dimension(600, 150);
                        pd.setPreferredSize(size);
                        pd.setMinimumSize(size);
                        size=Toolkit.getDefaultToolkit().getScreenSize();
                        pd.setLocation((size.width-600)/2+Main.screen*size.width,(size.height-150)/2);
                        boolean r = pd.showDialog();
                        if (r == true) {
                            str=pd.getName()+"\n"+pd.getPass();
                        } else {
                            str="";
                        }
                        String filename = "C:/Works/temp/pwd.txt";
                        Integer keycode=KeyEvent.VK_F12;
                        BufferedWriter out;
                        try {
                            out = new BufferedWriter(new FileWriter(filename));
                            out.write(str);
                            out.close();
                        } catch (IOException ex) {
                        }   
                        try {
                            Robot robot=new Robot();
                            robot.keyPress(keycode.intValue());
                        } catch (AWTException ex) {
                        }
                    }
                },
                KeyStroke.getKeyStroke(KeyEvent.VK_L, KeyEvent.CTRL_MASK),
                JComponent.WHEN_IN_FOCUSED_WINDOW);
        
        setResizable(false);
        setUndecorated(true);
        Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
        setSize(size);
        setLocation(Main.screen*size.width, 0);
        setLayout(new BorderLayout());
        ((JComponent) getContentPane()).setBorder(BorderFactory.createEmptyBorder(3, 3, 3, 3));

        PanelManager manager = new PanelManager();
        view = new ScalableXHTMLPanel(manager);
        view.addDocumentListener(manager);
        view.setCenteredPagedView(true);
        view.setBackground(Color.WHITE);
        FSScrollPane scroll = new FSScrollPane(view);
		this.add(scroll, BorderLayout.CENTER);


        JPanel toolbarPanel = new JPanel(new GridBagLayout());
        toolbarPanel.setBorder(BorderFactory.createEmptyBorder(0, 0, 3, 0));

        GridBagConstraints gbc=new GridBagConstraints();
        gbc.anchor=GridBagConstraints.LINE_START;
        gbc.fill=GridBagConstraints.HORIZONTAL;
        gbc.gridheight=1;
        gbc.gridwidth=1;
        gbc.gridx=0;
        gbc.gridy=0;
        gbc.weightx=1;
        gbc.weighty=0;
        toolbarPanel.add(new JPanel(),gbc);
        gbc.gridx++;
        gbc.fill=GridBagConstraints.NONE;
        gbc.weightx=0;
        gbc.gridx++;
        date1Button=createTextButton(
            "Начало: "+formatDatetime(date1),
            "Начало периода для протокола или рапорта",
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    int[] res=Main.selectDatetime(date1.get(Calendar.YEAR), date1.get(Calendar.MONTH)+1, date1.get(Calendar.DAY_OF_MONTH),date1.get(Calendar.HOUR_OF_DAY),date1.get(Calendar.MINUTE),date1.get(Calendar.SECOND), "Выбор начала периода для протокола или рапорта:");
                    if (res!=null) {
                        date1.set(res[0],res[1]-1, res[2], res[3], res[4], res[5]);
                        date1Button.setText("Начало: "+formatDatetime(date1));
                        try {
                            JSONObject obj=new JSONObject(lastData);
                            obj.getJSONObject("args").put("report_date",new JSONObject(formatDatetimeValue(date1)));
                            obj.getJSONObject("args").put("report_date2",new JSONObject(formatDatetimeValue(date2)));
                            BrowserFrame.lastData=obj.toString();
                            showReportByData(lastData);
                        } catch (JSONException ex) {
                            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                        
                    }
                }
            }
        );
        toolbarPanel.add(
            date1Button,
            gbc
        );
        gbc.gridx++;
        date2Button=createTextButton(
            "Окончание: "+formatDatetime(date2),
            "Окончание периода для протокола или рапорта",
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    int[] res=Main.selectDatetime(date2.get(Calendar.YEAR), date2.get(Calendar.MONTH)+1, date2.get(Calendar.DAY_OF_MONTH),date2.get(Calendar.HOUR_OF_DAY),date2.get(Calendar.MINUTE),date2.get(Calendar.SECOND), "Выбор окончания периода для протокола или рапорта:");
                    if (res!=null) {
                        date2.set(res[0],res[1]-1, res[2], res[3], res[4], res[5]);
                        date2Button.setText("Окончание: "+formatDatetime(date2));
                        try {
                            JSONObject obj=new JSONObject(lastData);
                            obj.getJSONObject("args").put("report_date",new JSONObject(formatDatetimeValue(date1)));
                            obj.getJSONObject("args").put("report_date2",new JSONObject(formatDatetimeValue(date2)));
                            BrowserFrame.lastData=obj.toString();
                            final String serverUrl=Main.getActiveBackend();
                            String loadingUrl=serverUrl +"/report_loading.htm";
                            System.out.println(loadingUrl);
                            showReportByData(lastData);
                        } catch (JSONException ex) {
                            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                }
            }
        );
        toolbarPanel.add(
            date2Button,
            gbc
        );
        gbc.gridx++;
        menuButton=createTextButton(
            "Меню протоколов и рапортов",
            "Вызов меню протоколов рапортов",
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    Point p = MouseInfo.getPointerInfo().getLocation();
                    Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
                    BrowserFrame.menu.show(BrowserFrame.this, p.x-Main.screen*size.width, p.y);
                }
            }
        );
        toolbarPanel.add(
            menuButton,
            gbc
        );
        gbc.gridx++;
        saveButton=createButton(
            "",
            "Сохранить рапорт",
            "SaveButton.icon",
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    OutputStream os = null;
                    try {
                        try {
                            JSONObject obj=new JSONObject(lastData);
                            MyDateFormat df=new MyDateFormat(0,"yyyy_MM_dd_HH_mm_ss");
                            String DocumentTitle=obj.getString("data")+"_"+df.format(date1.getTime())+"_"+df.format(date2.getTime()); //view.getDocumentTitle();
                            String PathToFiles=System.getProperty("user.home")+"\\Рапорта";
                            String outputFile = PathToFiles+"\\"+DocumentTitle.replaceAll(":","_").replaceAll("/","_").replaceAll("\\\\","_")+".pdf";
                            File file=new File(PathToFiles);
                            file.mkdirs();
                            os = new FileOutputStream(outputFile);
                            ITextRenderer renderer = new ITextRenderer();
                            renderer.setDocument(view.getDocument(),Main.getActiveBackend());
                            renderer.layout();
                            renderer.createPDF(os);
                            os.close();
                            JOptionPane.showMessageDialog(BrowserFrame.this,"Рапорт сохранен в файл "+outputFile,"Сохранение рапорта",JOptionPane.INFORMATION_MESSAGE);
                        } catch (JSONException ex) {
                            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    } catch (IOException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                    } catch (DocumentException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                    } finally {
                        try {
                            os.close();
                        } catch (IOException ex) {
                            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                }
            }
        );
        toolbarPanel.add(
            saveButton,
            gbc
        );
        gbc.gridx++;
        toolbarPanel.add(new JPanel(),gbc);
        gbc.gridx++;
        printButton=createButton(
            "",
            "Печатать рапорт",
            "PrintButton.icon",
            new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    OutputStream os = null;
                    String outputFile="";
                    try {
                        String DocumentTitle=view.getDocumentTitle();
                        String PathToFiles=System.getProperty("user.home")+"\\Рапорта";
                        outputFile = PathToFiles+"\\"+DocumentTitle+".pdf";
                        File file=new File(PathToFiles);
                        file.mkdirs();
                        os = new FileOutputStream(outputFile);
                        ITextRenderer renderer = new ITextRenderer();
                        renderer.setDocument(view.getDocument(),Main.getActiveBackend());
                        renderer.layout();
                        renderer.createPDF(os);

                    } catch (IOException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                    } catch (DocumentException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                    } finally {
                        try {
                            os.close();
                        } catch (IOException ex) {
                            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                    PDDocument document = null;
                    try {
                        document = PDDocument.load(outputFile);
                    } catch (IOException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                    }
                    try {
                        document.print();
                        JOptionPane.showMessageDialog(BrowserFrame.this,"Рапорт отправлен на печать","Печать рапорта",JOptionPane.INFORMATION_MESSAGE);
                    } catch (PrinterException ex) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                        JOptionPane.showMessageDialog(BrowserFrame.this,"Ошибка печати рапорта","Печать рапорта",JOptionPane.INFORMATION_MESSAGE);
                    }
                }
            }
        );
        toolbarPanel.add(
            printButton,
            gbc
        );
        gbc.gridx++;
        toolbarPanel.add(new JPanel(),gbc);
        gbc.gridx++;
        refreshButton=createButton(
            "",
            "Обновить рапорт",
            "RecycleButton.icon",
            new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    showReportByData(lastData);
                }
            }
        );
        toolbarPanel.add(
            refreshButton,
            gbc
        );
        gbc.gridx++;
        toolbarPanel.add(new JPanel(),gbc);
        gbc.gridx++;
        toolbarPanel.add(
            createButton(
                "",
                "Закрыть окно рапортов",
                "CloseButton.icon",
                new ActionListener() {
                        
                    @Override
                    public void actionPerformed(ActionEvent e) {
                        BrowserFrame.this.dispose();
                    }
                }
            ),
            gbc
        );
        add(toolbarPanel, BorderLayout.NORTH);
        
        
    }

    private JButton createButton(String text,String tooltipText,String iconKey,ActionListener action) {
        JButton b = new JButton();
        b.setIcon(getIcon(iconKey));
        b.setText(text);
        b.setToolTipText(tooltipText);
        b.setDoubleBuffered(true);
        b.setFocusable(false);
        b.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        b.setMaximumSize(new java.awt.Dimension(32, 32));
        b.setMinimumSize(new java.awt.Dimension(32, 32));
        b.setPreferredSize(new java.awt.Dimension(32, 32));
        b.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        b.addActionListener(action);
        return b;
    }
    
    private JButton createTextButton(String text,String tooltipText,ActionListener action) {
        JButton b = new JButton();
        b.setText(text);
        b.setToolTipText(tooltipText);
        b.setDoubleBuffered(true);
        b.setFocusable(false);
        b.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        b.setMaximumSize(new java.awt.Dimension(65535, 32));
        b.setMinimumSize(new java.awt.Dimension(32, 32));
        b.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        b.addActionListener(action);
        return b;
    }
    
    private Icon getIcon(String key) {
        try {
            try {
                return new ImageIcon(BrowserFrame.class.getResource("resources/" + bundle.getString(key)).toURI().toURL());
            } catch (MalformedURLException ex) {
                Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
                return null;
            }
        } catch (URISyntaxException ex) {
            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }
    
    public static void showURL(final String url) {
        date1Button.setVisible(false);
        date2Button.setVisible(false);
        menuButton.setVisible(false);
        printButton.setVisible(false);
        saveButton.setVisible(false);
        refreshButton.setVisible(false);
        Thread thread=new Thread() {
            @Override
            public void run() {
                frame.setVisible(true);
                view.setDocument(url);
            }
        };
        thread.start();
        frame.setVisible(true);
    }
    
    public static void show(final String data) throws JSONException, MalformedURLException, URISyntaxException, InterruptedException {
        show(data,null,null);
    }
    
    public static void show(final String data,Object menuObj,Object paramsObj) throws JSONException, MalformedURLException, URISyntaxException, InterruptedException {
        date1Button.setVisible(true);
        date2Button.setVisible(true);
        menuButton.setVisible(true);
        printButton.setVisible(true);
        saveButton.setVisible(true);
        refreshButton.setVisible(true);
        JSONObject obj=new JSONObject(data);
        JSONObject reportDate=obj.getJSONObject("args").getJSONObject("report_date");
        date1.set(reportDate.getInt("year"), reportDate.getInt("month")-1, reportDate.getInt("day"), reportDate.getInt("hour"), reportDate.getInt("minute"), reportDate.getInt("second"));
        if (obj.getJSONObject("args").has("report_date2")) {
            JSONObject reportDate2=obj.getJSONObject("args").getJSONObject("report_date2");
            date2.set(reportDate2.getInt("year"), reportDate2.getInt("month")-1, reportDate2.getInt("day"), reportDate2.getInt("hour"), reportDate2.getInt("minute"), reportDate2.getInt("second"));
        } else {
            date2=(Calendar) date1.clone();
        }
        date1Button.setText("Начало: "+formatDatetime(date1));
        date2Button.setText("Окончание: "+formatDatetime(date2));
        menu=getMenu(menuObj,paramsObj,menuObj).getPopupMenu();
        frame.setVisible(true);
        frame.setVisible(true);
        showReportByData(data);
    }

    private static void showReportByData(final String data) {
        Thread thread=new Thread() {
            @Override
            public void run() {
                showReportByData2(data);
            }
        };
        thread.start();
    }
    
    private static void showReportByData2(final String data) {
        final String serverUrl=Main.getActiveBackend();
        String loadingUrl=serverUrl +"/report_loading.htm";
        view.setDocument(loadingUrl);
        
        JSONObject requestData=null;
        try {
            requestData=new JSONObject(data);
        } catch (JSONException ex) {
            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex);
        }
        Callback requestCallback=new Callback() {
            @Override
            public void call(Object param) {
                InputStream is = null;
                String reportSource="";
                InputStream errorIs = null;
                String errorReportSource;
                try {
                    JSONObject reportJSON=(JSONObject)((Object[])param)[1];
                    reportSource=(String)reportJSON.get("result");
                    BrowserFrame.lastData=data;
                    is = new ByteArrayInputStream(reportSource.getBytes("UTF-8"));
                    view.setDocument(is,serverUrl);
                } catch (Exception ex2) {
                    try {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex2);
                        errorReportSource="<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"><html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body><h1>Ошибка формирования и загрузки рапорта!</h1><h3>Код рапорта:</h3><br/><pre>"+escapeHtml4(reportSource)+"</pre></body></html>";
                        errorIs = new ByteArrayInputStream(errorReportSource.getBytes("UTF-8"));
                        view.setDocument(errorIs,serverUrl);
                    } catch (Exception ex3) {
                        Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex3);
                    } finally {
                        try {
                            errorIs.close();
                        } catch (IOException ex4) {

                        }
                    }
                } finally {
                    try {
                        is.close();
                    } catch (IOException ex5) {
                        
                    }
                }
            } 
        };
        try {
            Main.execute_async3(
                    "get_report",
                    requestData,
                    requestCallback      
            );
        } catch (JSONException ex6) {
            Logger.getLogger(BrowserFrame.class.getName()).log(Level.SEVERE, null, ex6);
        }
    }
    
    private static JMenu getMenu(final Object menuObj,final Object paramsObj,final Object mainMenu) {
        JMenu localMenu=new JMenu();
        if (menuObj != null) {
            if (menuObj instanceof NativeArray) {
                NativeArray arr=(NativeArray)menuObj;
                for(int i=0; i< arr.getLength(); i++) {
                    NativeObject elem=(NativeObject)arr.get(i, null);
                    String menuItemText=(String)NativeObject.getProperty(elem, "text");
                    Object submenuObj=NativeObject.getProperty(elem, "submenu");
                    if (submenuObj instanceof NativeArray) {
                        JMenu submenu=getMenu((NativeArray)submenuObj,paramsObj,mainMenu);
                        submenu.setText(menuItemText);
                        localMenu.add(submenu);
                    } else {
                        final String menuItemId=(String)NativeObject.getProperty(elem, "id");
                        JMenuItem item=new JMenuItem(menuItemText);
                        item.addActionListener(
                            new ActionListener(){

                                @Override
                                public void actionPerformed(ActionEvent e) {
                                try {
                                    Object params=NativeObject.getProperty((Scriptable)paramsObj,menuItemId);
                                    String template=(String)NativeObject.getProperty((Scriptable)params,"template");
                                    String datasource=(String)NativeObject.getProperty((Scriptable)params,"datasource");
                                    String shift="0";
                                    try {
                                        shift=((Number)NativeObject.getProperty((Scriptable)params,"shift")).toString();
                                    } catch (Exception exp) {
                                    }
                                    String request="{'template':'"+template+"','data':'"+datasource+"','args':{"+
                                        formatDatetime("report_date",date1)+","+
                                        formatDatetime("report_date2",date2)+","+
                                        "'shift':'"+shift+"'}}";
                                    System.out.println(request);
                                    BrowserFrame.show(request,mainMenu,paramsObj);
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
                            }
                       );
                       localMenu.add(item);
                    }
                }
            }
        }
        return localMenu;
    }
    
    private static String formatDate(Calendar d) {
        return 
            String.format("%1$tY-%1$tm-%1$td",d);
    }
    
    private static String formatDatetime(Calendar d) {
        return 
            String.format("%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS",d);
    }
    
    private static String formatDate(String fieldName,Calendar d) {
        return 
            String.format("'%1$s':{'year':%2$tY,'month':%2$tm,'day':%2$td}",fieldName,d);
    }

    private static String formatDatetime(String fieldName,Calendar d) {
        return 
            String.format("'%1$s':{'year':%2$tY,'month':%2$tm,'day':%2$td,'hour':%2$tH,'minute':%2$tM,'second':%2$tS}",fieldName,d);
    }

    private static String formatDateValue(Calendar d) {
        return 
            String.format("{'year':%1$tY,'month':%1$tm,'day':%1$td}",d);
    }

    private static String formatDatetimeValue(Calendar d) {
        return 
            String.format("{'year':%1$tY,'month':%1$tm,'day':%1$td,'hour':%1$tH,'minute':%1$tM,'second':%1$tS}",d);
    }
    
    public static void main(String[] args) {
        
    }

}