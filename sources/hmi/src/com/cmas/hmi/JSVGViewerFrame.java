package com.cmas.hmi;

import com.Ostermiller.util.PasswordDialog;
import java.awt.*;
import java.awt.event.*;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import org.apache.batik.bridge.*;
import org.apache.batik.script.rhino.RhinoInterpreter;
import org.apache.batik.script.rhino.WindowWrapper.FunctionWrapper;
import org.apache.batik.swing.JSVGCanvas;
import org.apache.batik.swing.gvt.GVTTreeRendererEvent;
import org.apache.batik.swing.gvt.GVTTreeRendererListener;
import org.apache.batik.swing.svg.*;
import org.apache.batik.util.ParsedURL;
import org.apache.batik.util.Service;
import org.apache.batik.util.gui.JErrorPane;
import org.apache.batik.util.gui.MemoryMonitor;
import org.w3c.dom.Element;
import org.w3c.dom.svg.SVGDocument;



public class JSVGViewerFrame
        extends JFrame
        implements SVGDocumentLoaderListener,
        GVTTreeBuilderListener,
        SVGLoadEventDispatcherListener,
        GVTTreeRendererListener,
        LinkActivationListener,
        UpdateManagerListener {

    protected boolean fullscreen = false;
    protected Vector handlers;
    protected static SquiggleInputHandler defaultHandler = new SVGInputHandler();
    protected Application application;
    protected Canvas svgCanvas;
    protected JPanel svgCanvasPanel;
    protected boolean debug;
    protected boolean autoAdjust = true;
    protected boolean managerStopped;
    protected SVGUserAgent userAgent = new UserAgent();
    protected SVGDocument svgDocument;
    protected MemoryMonitor memoryMonitorFrame;
    
    private SaveAction saveAction=new SaveAction();
    private MonitorAction monitorAction = new MonitorAction();
    private LoginAction loginAction=new LoginAction();
    private ReloadAction reloadAction=new ReloadAction();
    private ReloadInvoke reloadInvoke=new ReloadInvoke();
    private CloseInvoke closeInvoke=new CloseInvoke();
    private BackendAction backendAction=new BackendAction();
    private BackendInvoke backendInvoke=new BackendInvoke();
    private ArrayList<CallFunctionAction> keyActions=new ArrayList<CallFunctionAction>();
    
    protected Map listeners = new HashMap();
    protected Dimension size=null;
    protected JPanel p=null;
    protected EmptyBorder canvasBorder=null;
    protected BorderLayout canvasLayout=null;
    protected EmptyBorder pBorder=null;
    protected BorderLayout pLayout=null;
    protected boolean SVGDocumentLoaded=false;
    protected String initScript="";
    private TimerTask tt;
    protected java.util.Timer timer = new java.util.Timer(true);
    
    @SuppressWarnings("unchecked")
    public JSVGViewerFrame(Application app) {
        this(app,"");

    }
    
    public JSVGViewerFrame(Application app,String initialScript) {
        application = app;
        initScript=initialScript;
        
        setBackground(new Color(Main.backgroundColor));
        setResizable(false);
        setUndecorated(true);
        size = Toolkit.getDefaultToolkit().getScreenSize();
        setSize(size);
        setLocation(Main.screen * size.width, 0);
        svgCanvas = new Canvas(userAgent, true, true);
        svgCanvas.setDoubleBufferedRendering(true);
        svgCanvas.setBackground(new Color(Main.backgroundColor));
//        svgCanvas.setIgnoreRepaint(true);
//        svgCanvas.setProgressivePaint(true);
//        svgCanvas.setOpaque(true);
        
        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                System.exit(0);
            }
            
        });
        
        getRootPane().getActionMap().put("saveAction",saveAction);
        getRootPane().getActionMap().put("memoryAction",monitorAction);
        getRootPane().getActionMap().put("loginAction",loginAction);
        getRootPane().getActionMap().put("reloadAction",reloadAction);
        getRootPane().getActionMap().put("backendAction",backendAction);
        
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_S, KeyEvent.CTRL_MASK),"saveAction");
//        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_M, KeyEvent.CTRL_MASK),"memoryAction");
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_L, KeyEvent.CTRL_MASK),"loginAction");
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_R, KeyEvent.CTRL_MASK+KeyEvent.ALT_MASK+KeyEvent.SHIFT_MASK),"reloadAction");
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_B, KeyEvent.CTRL_MASK),"backendAction");

        canvasLayout=new BorderLayout();
        canvasBorder=new EmptyBorder(0, 0, 0, 0);
        pLayout=new BorderLayout();
        pBorder=new EmptyBorder(0, 0, 0, 0);
        
        svgCanvasPanel = new JPanel(canvasLayout);
        svgCanvasPanel.setBorder(canvasBorder);
        svgCanvasPanel.setBackground(new Color(Main.backgroundColor));
        svgCanvasPanel.add(svgCanvas, BorderLayout.CENTER);
        
        p = new JPanel(pLayout);
        p.setBorder(pBorder);
        p.add(svgCanvasPanel, BorderLayout.CENTER);
        p.setBackground(new Color(Main.backgroundColor));
        getContentPane().add(p, BorderLayout.CENTER);

        svgCanvas.addSVGDocumentLoaderListener(JSVGViewerFrame.this);
        svgCanvas.addGVTTreeBuilderListener(JSVGViewerFrame.this);
        svgCanvas.addSVGLoadEventDispatcherListener(JSVGViewerFrame.this);
        svgCanvas.addGVTTreeRendererListener(JSVGViewerFrame.this);
        svgCanvas.addLinkActivationListener(JSVGViewerFrame.this);
        svgCanvas.addUpdateManagerListener(JSVGViewerFrame.this);

    }

    public void executeScript(String script) {
       svgCanvas.executeScript(script);
    }
    
    @Override
    public void dispose() {
        try {
            setVisible(false);
            svgCanvas.stopProcessing();
            clearListeners();
            svgCanvas.dispose();
            svgCanvas=null;

            svgCanvasPanel.removeAll();
            svgCanvasPanel.setLayout(null);
            svgCanvasPanel.setBorder(null);
            svgCanvasPanel=null;
            canvasBorder=null;
            canvasLayout=null;

            p.removeAll();
            p.setLayout(null);
            p.setBorder(null);
            p=null;
            pLayout=null;
            pBorder=null;

            saveAction=null;
            monitorAction=null;
            loginAction=null;
            reloadAction=null;
            backendAction=null;
            reloadInvoke=null;
            closeInvoke=null;
            backendInvoke=null;
            keyActions.clear();
            keyActions=null;
            userAgent=null;
            getRootPane().getInputMap().clear();
            getRootPane().getActionMap().clear();

            listeners.clear();
            listeners=null;

            getRootPane().removeAll();

            size=null;
            svgDocument=null;
            defaultHandler=null;
            handlers=null;
            memoryMonitorFrame=null;

            setIconImage(null);
            setFont(null);

            getRootPane().setLayout(null);
            getRootPane().setBorder(null);
            setRootPane(null);
            javax.swing.RepaintManager.setCurrentManager(null);
            Graphics graphics=this.getBufferStrategy().getDrawGraphics();
            graphics.dispose();
        } catch (Exception e) {
            e.printStackTrace();
        }
        application=null;
        super.dispose();
        System.gc();
    }

    public void setDebug(boolean b) {
        debug = b;
    }

    public void setAutoAdjust(boolean b) {
        autoAdjust = b;
    }

    public JSVGCanvas getJSVGCanvas() {
        return svgCanvas;
    }


    private void setDisableInteractions(boolean disabled) {
        svgCanvas.setDisableInteractions(disabled);
        Object[] keys = listeners.keySet().toArray();
        for (int i = 0; i < keys.length; i++) {
            Action action = (Action) listeners.get(keys[i]);
            if (action != null) {
                if (!(action instanceof MonitorAction)) {
                    action.setEnabled(!disabled);
                }
            }
        }
    }

    public void setFullscreen(boolean f) {
        if ((f == true) && (this.fullscreen == false)) {
            this.fullscreen = true;
            setDisableInteractions(this.fullscreen);
            this.requestFocus();
            svgCanvas.requestFocus();
        } else if ((f == false) && (this.fullscreen == true)) {
            this.fullscreen = false;
            setDisableInteractions(this.fullscreen);
        }
    }
    
    public void addKeyAction(final FunctionWrapper fw,long key, long mask) {
        CallFunctionAction action=new CallFunctionAction((int)key,(int)mask,fw);
        keyActions.add(action);
        getRootPane().getActionMap().put(fw.hashCode(),action);
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke((int)key, (int)mask),fw.hashCode());
    }

    public void showSVGDocument(String uri) {
        try {
            ParsedURL purl = new ParsedURL(uri);
            SquiggleInputHandler handler = getInputHandler(purl);

            handler.handle(purl,
                    JSVGViewerFrame.this);
        } catch (Exception e) {
            if (userAgent != null) {
                userAgent.displayError(e);
                userAgent.showCloseWindow();
            }
        }

    }

    public SquiggleInputHandler getInputHandler(ParsedURL purl) throws IOException {
        Iterator iter = getHandlers().iterator();
        SquiggleInputHandler handler = null;

        while (iter.hasNext()) {
            SquiggleInputHandler curHandler =
                    (SquiggleInputHandler) iter.next();
            if (curHandler.accept(purl)) {
                handler = curHandler;
                break;
            }
        }

        if (handler == null) {
            handler = defaultHandler;
        }

        return handler;
    }

    protected Vector getHandlers() {
        if (handlers != null) {
            return handlers;
        }

        handlers = new Vector();
        registerHandler(new SVGInputHandler());

        Iterator iter = Service.providers(SquiggleInputHandler.class);
        while (iter.hasNext()) {
            SquiggleInputHandler handler = (SquiggleInputHandler) iter.next();

            registerHandler(handler);
        }

        return handlers;
    }

    /**
     * Registers an input file handler by adding it to the handlers map.
     *
     * @param handler the new input handler to register.
     */
    private synchronized void registerHandler(SquiggleInputHandler handler) {
        handlers = getHandlers();
        handlers.addElement(handler);
    }

    @Override
    public void documentLoadingStarted(SVGDocumentLoaderEvent e) {
    }

    @Override
    public void documentLoadingCompleted(SVGDocumentLoaderEvent e) {
        setSVGDocument(e.getSVGDocument(),
                e.getSVGDocument().getURL(),
                e.getSVGDocument().getTitle());
    }

    public void setSVGDocument(SVGDocument svgDocument,
            String svgDocumentURL,
            String svgDocumentTitle) {
        this.svgDocument = svgDocument;

    }

    @Override
    public void documentLoadingCancelled(SVGDocumentLoaderEvent e) {
    }

    @Override
    public void documentLoadingFailed(SVGDocumentLoaderEvent e) {
    }

    @Override
    public void gvtBuildStarted(GVTTreeBuilderEvent e) {
    }


    @Override
    public void gvtBuildCompleted(GVTTreeBuilderEvent e) {
        svgCanvas.setSelectionOverlayXORMode(application.isSelectionOverlayXORMode());
    }

    @Override
    public void gvtBuildCancelled(GVTTreeBuilderEvent e) {
        svgCanvas.setSelectionOverlayXORMode(application.isSelectionOverlayXORMode());
    }


    @Override
    public void gvtBuildFailed(GVTTreeBuilderEvent e) {
        svgCanvas.setSelectionOverlayXORMode(application.isSelectionOverlayXORMode());
        if (autoAdjust) {
            pack();
        }
    }

    @Override
    public void svgLoadEventDispatchStarted(SVGLoadEventDispatcherEvent e) {
    }

    @Override
    public void svgLoadEventDispatchCompleted(SVGLoadEventDispatcherEvent e) {
        SVGDocumentLoaded=true;
        System.out.println("Document "+getTitle()+" loaded.");
        executeScript(initScript+"init();");
    }

    @Override
    public void svgLoadEventDispatchCancelled(SVGLoadEventDispatcherEvent e) {
    }

    @Override
    public void svgLoadEventDispatchFailed(SVGLoadEventDispatcherEvent e) {
    }


    @Override
    public void gvtRenderingPrepare(GVTTreeRendererEvent e) {
    }

    @Override
    public void gvtRenderingStarted(GVTTreeRendererEvent e) {
    }

    @Override
    public void gvtRenderingCompleted(GVTTreeRendererEvent e) {
    }

    @Override
    public void gvtRenderingCancelled(GVTTreeRendererEvent e) {
    }

    @Override
    public void gvtRenderingFailed(GVTTreeRendererEvent e) {
    }

    @Override
    public void linkActivated(LinkActivationEvent e) {
    }


    @Override
    public void managerStarted(UpdateManagerEvent e) {
        managerStopped = false;
    }

    @Override
    public void managerSuspended(UpdateManagerEvent e) {
    }

    @Override
    public void managerResumed(UpdateManagerEvent e) {
    }

    @Override
    public void managerStopped(UpdateManagerEvent e) {
        managerStopped = true;
    }

    @Override
    public void updateStarted(final UpdateManagerEvent e) {
    }

    @Override
    public void updateCompleted(final UpdateManagerEvent e) {
    }

    @Override
    public void updateFailed(UpdateManagerEvent e) {
    }

    public void loadSVGDocument(String url) {
        SVGDocumentLoaded=false;
        getJSVGCanvas().loadSVGDocument(url);
    }
    
    public boolean isSVGDocumentLoaded() {
        return SVGDocumentLoaded;
    }
    
    protected class UserAgent implements SVGUserAgent {

        protected UserAgent() {
        }

        @Override
        public void displayError(String message) {
            if (debug) {
                System.err.println(message);
            }
            JOptionPane pane =
                    new JOptionPane(message, JOptionPane.ERROR_MESSAGE);
            JDialog dialog = pane.createDialog(JSVGViewerFrame.this, "Ошибка");
            dialog.setModal(false);
            dialog.setVisible(true);
        }

        @Override
        public void displayError(Exception ex) {
            if (debug) {
                ex.printStackTrace();
            }
            JErrorPane pane =
                    new JErrorPane(ex, JOptionPane.ERROR_MESSAGE);
            JDialog dialog = pane.createDialog(JSVGViewerFrame.this, "Ошибка");
            dialog.setModal(false);
            dialog.setVisible(true);
        }

        @Override
        public void displayMessage(String message) {
        }

        @Override
        public void showSetFullscreen(boolean fullscreen) {
            JSVGViewerFrame.this.setFullscreen(fullscreen);
        }
        
        @Override
        public void addKeyAction(final FunctionWrapper fw,long key, long mask) {
            JSVGViewerFrame.this.addKeyAction(fw,key,mask);
        }

        @Override
        public void showPopupMenu(JPopupMenu menu) {
            Point p = MouseInfo.getPointerInfo().getLocation();
            Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
            menu.show(JSVGViewerFrame.this, p.x-Main.screen*size.width, p.y);
        }

        @Override
        public void showCloseWindow() {
            boolean res=application.closeJSVGViewerFrame(JSVGViewerFrame.this);
            if (res==false) {
                dispose(); //SwingUtilities.invokeLater(closeInvoke);
            }
        }

        @Override
        public void showOpenURL(String url, boolean visible) {
            openLink(url, visible);
        }

        @Override
        public void showAlert(String message) {
            svgCanvas.showAlert(message);
        }

        @Override
        public String showPrompt(String message) {
            return svgCanvas.showPrompt(message);
        }

        @Override
        public String showPrompt(String message, String defaultValue) {
            return svgCanvas.showPrompt(message, defaultValue);
        }

        @Override
        public boolean showConfirm(String message) {
            return svgCanvas.showConfirm(message);
        }

        @Override
        public float getPixelUnitToMillimeter() {
            return (float) 3.7795275590551181102362204724409;
        }

        @Override
        public float getPixelToMM() {
            return getPixelUnitToMillimeter();

        }

        @Override
        public String getDefaultFontFamily() {
            return application.getDefaultFontFamily();
        }

        @Override
        public float getMediumFontSize() {
            return 9f * 25.4f / (72f * getPixelUnitToMillimeter());
        }

        @Override
        public float getLighterFontWeight(float f) {
            int weight = ((int) ((f + 50) / 100)) * 100;
            switch (weight) {
                case 100:
                    return 100;
                case 200:
                    return 100;
                case 300:
                    return 200;
                case 400:
                    return 300;
                case 500:
                    return 400;
                case 600:
                    return 400;
                case 700:
                    return 400;
                case 800:
                    return 400;
                case 900:
                    return 400;
                default:
                    throw new IllegalArgumentException("Неправильная толщина букв: " + f);
            }
        }

        @Override
        public float getBolderFontWeight(float f) {
            int weight = ((int) ((f + 50) / 100)) * 100;
            switch (weight) {
                case 100:
                    return 600;
                case 200:
                    return 600;
                case 300:
                    return 600;
                case 400:
                    return 600;
                case 500:
                    return 600;
                case 600:
                    return 700;
                case 700:
                    return 800;
                case 800:
                    return 900;
                case 900:
                    return 900;
                default:
                    throw new IllegalArgumentException("Неправильная толщина букв: " + f);
            }
        }

        @Override
        public String getLanguages() {
            return application.getLanguages();
        }

        @Override
        public String getUserStyleSheetURI() {
            return application.getUserStyleSheetURI();
        }

        @Override
        public String getXMLParserClassName() {
            return application.getXMLParserClassName();
        }

        @Override
        public boolean isXMLParserValidating() {
            return application.isXMLParserValidating();
        }

        @Override
        public String getMedia() {
            return application.getMedia();
        }

        @Override
        public String getAlternateStyleSheet() {
            return "";
        }
 
        @Override
        public void openLink(String uri, boolean visible) {
            application.openLink(uri, JSVGViewerFrame.this,visible);
        }

        @Override
        public void openLinkWithParameters(String uri, boolean visible,String initialScript) {
            application.openLinkWithParameters(uri, JSVGViewerFrame.this,visible,initialScript);
        }
        
        @Override
        public boolean supportExtension(String s) {
            return false;
        }

        @Override
        public void handleElement(Element elt, Object data) {
        }

        @Override
        public ScriptSecurity getScriptSecurity(String scriptType,
                ParsedURL scriptURL,
                ParsedURL docURL) {
            if (!application.canLoadScriptType(scriptType)) {
                return new NoLoadScriptSecurity(scriptType);
            } else {
                switch (application.getAllowedScriptOrigin()) {
                    case ResourceOrigin.ANY:
                        return new RelaxedScriptSecurity(scriptType,
                                scriptURL,
                                docURL);
                    case ResourceOrigin.DOCUMENT:
                        return new DefaultScriptSecurity(scriptType,
                                scriptURL,
                                docURL);
                    case ResourceOrigin.EMBEDED:
                        return new EmbededScriptSecurity(scriptType,
                                scriptURL,
                                docURL);
                    default:
                        return new NoLoadScriptSecurity(scriptType);
                }
            }
        }
        
        @Override
        public void checkLoadScript(String scriptType,
                ParsedURL scriptURL,
                ParsedURL docURL) throws SecurityException {
            ScriptSecurity s = getScriptSecurity(scriptType,
                    scriptURL,
                    docURL);

            if (s != null) {
                s.checkLoadScript();
            }
        }

        @Override
        public ExternalResourceSecurity getExternalResourceSecurity(ParsedURL resourceURL,
                ParsedURL docURL) {
            switch (application.getAllowedExternalResourceOrigin()) {
                case ResourceOrigin.ANY:
                    return new RelaxedExternalResourceSecurity(resourceURL,
                            docURL);
                case ResourceOrigin.DOCUMENT:
                    return new DefaultExternalResourceSecurity(resourceURL,
                            docURL);
                case ResourceOrigin.EMBEDED:
                    return new EmbededExternalResourceSecurity(resourceURL);
                default:
                    return new NoLoadExternalResourceSecurity();
            }
        }

        @Override
        public void checkLoadExternalResource(ParsedURL resourceURL,
                ParsedURL docURL) throws SecurityException {
            ExternalResourceSecurity s = getExternalResourceSecurity(resourceURL, docURL);

            if (s != null) {
                s.checkLoadExternalResource();
            }
        }

        @Override
        public void showOpenURLWithParameters(String url, boolean newwindow, String initialScript) {
             openLinkWithParameters(url, newwindow,initialScript);
        }
    }

    public void clearListeners() {
        svgCanvas.removeSVGDocumentLoaderListener(this);
        svgCanvas.removeGVTTreeBuilderListener(this);
        svgCanvas.removeSVGLoadEventDispatcherListener(this);
        svgCanvas.removeGVTTreeRendererListener(this);
        svgCanvas.removeLinkActivationListener(this);
        svgCanvas.removeUpdateManagerListener(this);
    }
    
    public void setHideSize(boolean hide) {
        if (hide==true) {
            size=getSize();
            setSize(0,0);
        } else {
            setSize(size);
        }
    }
    
    public void reloadCurrentFrame() {
        String urlFull="";
        String url="";
        URL u=null;
        
        Main.clearCache();
        try {
            urlFull=svgCanvas.getUrl();
            u=new URL(urlFull);
            url=u.getPath();
        } catch (MalformedURLException ex) {
            Logger.getLogger(JSVGViewerFrame.class.getName()).log(Level.SEVERE, null, ex);
            System.exit(0);
        }
        
        int i=0;;
        for (i=0; i<keyActions.size(); i++) {
            getRootPane().getActionMap().remove(keyActions.get(i).getFw().hashCode());
            getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).remove(KeyStroke.getKeyStroke(keyActions.get(i).getKey(), keyActions.get(i).getMask()));
        }
        keyActions.clear();
        
        loadSVGDocument(Main.getActiveBackend()+url);


    }
    
    public void closeCurrentFrame() {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                dispose();
            }
        });
    }
    
    public String getSVGCanvasURL() {
        return svgCanvas.getUrl();
    }

    public class Canvas extends JSVGCanvas {
        
        Dimension screenSize;
        
        public Canvas(SVGUserAgent ua, boolean eventsEnabled, boolean selectableText) {
            super(ua, eventsEnabled, selectableText);
            screenSize = Toolkit.getDefaultToolkit().getScreenSize();
            setMaximumSize(screenSize);
        }

        @Override
        public Dimension getPreferredSize() {
            Dimension s = super.getPreferredSize();
            if (s.width > screenSize.width) {
                s.width = screenSize.width;
            }
            if (s.height > screenSize.height) {
                s.height = screenSize.height;
            }
            return s;
        }

        @Override
        public void setMySize(Dimension d) {
        }

        @Override
        public void setDisableInteractions(boolean b) {
            super.setDisableInteractions(b);

        }
            
        @Override
        public void dispose() {
            removeComponentListener(compListener);
            compListener=null;
            getActionMap().clear();
            setActionMap(null);
            getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).clear();
            setInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW,null);
            ((BridgeUserAgentWrapper)userAgent).setUserAgent(null);
            userAgent=null;
            removeKeyListener(listener);
            
            removeMouseListener(listener);
            removeMouseMotionListener(listener);
            removeMouseWheelListener((MouseWheelListener)listener);
            removeGVTTreeRendererListener(listener);
            if (getUpdateManager()!=null) {
                getUpdateManager().clearAllListeners();
            }
            super.dispose();

            pcs=null;
//            toolTipMap=null;
//            lastTarget=null;
//            toolTipDocs=null;
//            lastToolTipEventTarget=null;
            documentLoader=null;
            nextDocumentLoader=null;
            loader=null;
            gvtTreeBuilder=null;
            nextGVTTreeBuilder=null;
            svgLoadEventDispatcher=null;
            updateManager=null;
            nextUpdateManager=null;
            svgDocument=null;
            svgDocumentLoaderListeners=null;
            gvtTreeBuilderListeners=null;
            svgLoadEventDispatcherListeners=null;
            linkActivationListeners=null;
            updateManagerListeners=null;
            svgUserAgent=null;
            bridgeContext=null;
            prevComponentSize=null;
            afterStopRunnable=null;
            updateOverlay=null;
            viewingTransform=null;
            listener=null;
            gvtTreeRenderer=null;
            gvtRoot=null;
            rendererFactory=null;
            renderer=null;
            gvtTreeRendererListeners=null;
            progressivePaintThread=null;
            image=null;
            initialTransform=null;
            renderingTransform=null;
            paintingTransform=null;
            interactors=null;
            interactor=null;
            overlays=null;
            jgvtListeners=null;
            eventDispatcher=null;
            textSelectionManager=null;
            mouseListener=null;
        }

        /**
            * Returns the Rhino interpreter for this canvas.
            */
        public Object getRhinoInterpreter() {
            if (bridgeContext == null) {
                return null;
            }
            return bridgeContext.getInterpreter("text/ecmascript");
        }

        public String getUrl() {
            return this.svgDocument.getURL();
        }

        public void nullOut() {
            ToolTipManager ttipman = ToolTipManager.sharedInstance();
            ttipman.unregisterComponent(this);         
            this.releaseRenderingReferences();
            this.stopProcessing();
            if(this.getUpdateManager() != null) this.getUpdateManager().getBridgeContext().dispose();
            try {
                this.resumeProcessing();
            } catch (IllegalStateException ex) {

            }

            this.deselectAll();
            this.removeAll();
            this.bridgeContext = null;
            this.listenerList = null;
        }
        
        public void executeScript(String script) {
            RhinoInterpreter interpreter=(RhinoInterpreter)getRhinoInterpreter();
            if (interpreter!=null) {
                interpreter.evaluate(script);
            }
        }

    }
    
    protected class MonitorAction extends AbstractAction {

        public MonitorAction() {
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            if (memoryMonitorFrame == null) {
                memoryMonitorFrame = new MemoryMonitor();
                Rectangle fr = getBounds();
                Dimension md = memoryMonitorFrame.getSize();
                memoryMonitorFrame.setLocation(fr.x + (fr.width - md.width) / 2,
                        fr.y + (fr.height - md.height) / 2);
            }
            memoryMonitorFrame.setVisible(true);
            memoryMonitorFrame.setAlwaysOnTop(true);
        }
    }
    
    protected class SaveAction extends AbstractAction {

        protected SaveAction() {
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            URI uri=URI.create(JSVGViewerFrame.this.svgDocument.getDocumentURI());
            String fname = uri.getPath() + "," +(new MyDateFormat(0, "yyyy-MM-dd HH:mm:ss").format(new Date()));
            fname = fname.replace(".", "-");
            fname = fname.replace(":", "-");
            fname = fname.replace(" ", "-");
            fname = fname.replace("/", "-");
            fname = fname.replace("\\", "-");
            fname = fname + ".pdf";
            File outputdir = new File(System.getProperty("user.home")+"\\Видеокадры\\");
            outputdir.mkdirs();
            SvgPrinter.saveAsPDF2(
                System.getProperty("user.home")+"\\Видеокадры\\" + fname,
                JSVGViewerFrame.this.svgCanvasPanel
            );
            JOptionPane.showMessageDialog(JSVGViewerFrame.this,"Видеокадр сохранен в файл "+System.getProperty("user.home")+"\\Видеокадры\\" + fname,"Сохранение видеокадра",JOptionPane.INFORMATION_MESSAGE);
        }
    }
    
    protected class LoginAction extends AbstractAction {

        protected LoginAction() {
        }

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
            String filename = Main.loginPath;
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
    }
    
    protected class ReloadAction extends AbstractAction {

        protected ReloadAction() {
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            SwingUtilities.invokeLater(reloadInvoke);
            
        }
    }
    
    protected class BackendAction extends AbstractAction {

        protected BackendAction() {
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            SwingUtilities.invokeLater(backendInvoke);
            
        }
    }
    
    protected class CallFunctionAction extends AbstractAction {

        protected FunctionWrapper fw;
        protected int key;
        protected int mask;
        
        protected CallFunctionAction(int key,int mask,FunctionWrapper fw) {
            this.key=key;
            this.mask=mask;
            this.fw=fw;
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            fw.run();
        }

        public FunctionWrapper getFw() {
            return fw;
        }

        public int getKey() {
            return key;
        }

        public int getMask() {
            return mask;
        }
        
        
        
    }
    
    protected class ReloadInvoke implements Runnable {

        protected ReloadInvoke() {

        }

        @Override
        public void run() {
            reloadCurrentFrame();
        }
    }
    
    protected class CloseInvoke implements Runnable {

        protected CloseInvoke() {

        }

        @Override
        public void run() {
            closeCurrentFrame();
        }
    }

    protected class BackendInvoke implements Runnable {

        protected BackendInvoke() {

        }

        @Override
        public void run() {
            JMenu menu=new JMenu();
            String currentBackend="Текущий активный сервер: "+Main.lastBackend;
            if ("".equals(Main.getSelectedBackend())) {
                currentBackend=currentBackend+" (определен автоматически)";
            } else {
                currentBackend=currentBackend+" (задан вручную)";
            }
            JMenuItem item=new JMenuItem(currentBackend);
            item.addActionListener(
                new ActionListener(){

                    @Override
                    public void actionPerformed(ActionEvent e) {
                    }
                }
            );
            menu.add(item);
            menu.add(new JSeparator());
            item=new JMenuItem("Автоматическое определение активного сервера");
            item.addActionListener(
                new ActionListener(){

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        Main.setSelectedBackend("");
                    }
                }
            );
            menu.add(item);
            String backends[]=Main.backend.split(",");
            for (int i=0; i<backends.length; i++) {
                final String backend=backends[i];
                item=new JMenuItem("Сервер \'http://"+backend+"\' (задать вручную)");
                item.addActionListener(
                    new ActionListener(){

                        @Override
                        public void actionPerformed(ActionEvent e) {
                            Main.setSelectedBackend(backend);
                        }
                    }
                );
                menu.add(item);
            }
            Point p = MouseInfo.getPointerInfo().getLocation();
            Dimension size=Toolkit.getDefaultToolkit().getScreenSize();
            menu.getPopupMenu().show(JSVGViewerFrame.this, p.x-Main.screen*size.width, p.y);
}
    }
    
}
