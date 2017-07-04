/*

 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */
package com.cmas.hmi;

import gnu.getopt.Getopt;
import gnu.getopt.LongOpt;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.*;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;
import java.lang.management.MemoryUsage;
import java.net.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import javax.swing.plaf.FontUIResource;
import org.apache.batik.dom.util.DocumentDescriptor;
import org.apache.batik.util.*;
import org.apache.batik.util.resources.ResourceManager;
import org.java_websocket.WebSocket.READYSTATE;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.*;
import org.w3c.dom.Document;

/**
 * This class contains the main method of an SVG viewer.
 *
 * @author <a href="mailto:stephane@hillion.org">Stephane Hillion</a>
 * @version $Id: Main.java 592619 2007-11-07 05:47:24Z cam $
 */
public class Main implements Application {

    protected static boolean isSingleFramed = false;
    /**
     * Extension used in addition to the scriptType value to read from the
     * PreferenceManager whether or not the scriptType can be loaded.
     */
    public static final String UNKNOWN_SCRIPT_TYPE_LOAD_KEY_EXTENSION = ".load";
    /**
     * User home property
     */
    public static final String PROPERTY_USER_HOME = "user.home";
    /**
     * System property for specifying an additional policy file.
     */
    public static final String PROPERTY_JAVA_SECURITY_POLICY = "java.security.policy";
    /**
     * Batik configuration sub-directory
     */
    public static final String BATIK_CONFIGURATION_SUBDIRECTORY = ".batik";
    /**
     * Name of the Squiggle configuration file
     */
    public static final String SQUIGGLE_CONFIGURATION_FILE = "preferences.xml";
    /**
     * Name of the Squiggle policy file
     */
    public static final String SQUIGGLE_POLICY_FILE = "__svgbrowser.policy";
    /**
     * Entry for granting network access to scripts
     */
    public static final String POLICY_GRANT_SCRIPT_NETWORK_ACCESS = "grant {\n  permission java.net.SocketPermission \"*\", \"listen, connect, resolve, accept\";\n};\n\n";
    /**
     * Entry for granting file system access to scripts
     */
    public static final String POLICY_GRANT_SCRIPT_FILE_ACCESS = "grant {\n  permission java.io.FilePermission \"<<ALL FILES>>\", \"read\";\n};\n\n";
    /**
     * Entry for the list of recently visited URI
     */
    public static final String PREFERENCE_KEY_VISITED_URI_LIST = "preference.key.visited.uri.list";
    /**
     * Entry for the maximum number of last visited URIs
     */
    public static final String PREFERENCE_KEY_VISITED_URI_LIST_LENGTH = "preference.key.visited.uri.list.length";
    /**
     * List of separators between URI values in the preference file
     */
    public static final String URI_SEPARATOR = " ";
    /**
     * Default font-family value.
     */
    public static final String DEFAULT_DEFAULT_FONT_FAMILY = "Arial, Helvetica, sans-serif";
    /**
     * SVG initialization file, used to trigger loading of most of the Batik
     * classes
     */
    public static final String SVG_INITIALIZATION = "resources/init.svg";
    /**
     * Stores the initialization file URI
     */
    protected String svgInitializationURI;
    public static int screen = 0;
    public static String backend = "dp4-server1:5001,dp4-server2:5001";
    public static String lastBackend = "";
    public static String localhostname = "";
    public static String startUrl = "";
    public static String loginPath = "";
    public static int backgroundColor = 0xffffff;
    public static Main main;
    private static String selectedBackend = "";
    private static String activeBackend = "";
    private static TimerTask tt;
    protected static java.util.Timer timer = new java.util.Timer(true);
    static CommClient[] commClient;
    static Date lastLog = new Date();

    static {
        try {
            localhostname = java.net.InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
        }
    }
    protected static HashMap cacheMap = new HashMap();

    /**
     * Creates a viewer frame and shows it..
     *
     * @param args The command-line arguments.
     */
    public static void main(String[] args) throws MalformedURLException, URISyntaxException, InterruptedException, JSONException {
//        for (;;) {
//            getActiveBackend();
//            Thread.sleep(1000);
//        }
        for (int i = 0; i < Locale.getAvailableLocales().length; i++) {
            if (("ru".equals(Locale.getAvailableLocales()[i].getLanguage())) && ("RU".equals(Locale.getAvailableLocales()[i].getCountry()))) {
                Locale.setDefault(Locale.getAvailableLocales()[i]);
            }
        }

        System.setProperty("sun.java2d.trace", "verbose");
        System.setProperty("sun.java2d.opengl", "True");
        System.setProperty("sun.java2d.accthreshold", "0");
        System.setProperty("file.encoding", "UTF-8");
        UIManager.put("OptionPane.yesButtonText", "Да");
        UIManager.put("OptionPane.noButtonText", "Нет");
        UIManager.put("OptionPane.cancelButtonText", "Отмена");
        UIManager.put("OptionPane.okButtonText", "Готово");
        UIManager.put("MenuItem.selectionBackground", Color.BLUE);
        UIManager.put("MenuItem.selectionForeground", Color.WHITE);

        main = new Main(args);
    }
    /**
     * The gui resources file name
     */
    public static final String RESOURCES =
            "com.cmas.hmi.resources.Main";
    /**
     * URL for Squiggle's security policy file
     */
    public static final String SQUIGGLE_SECURITY_POLICY = "com/cmas/hmi/resources/svgbrowser.policy";
    /**
     * The resource bundle
     */
    protected static ResourceBundle bundle;
    /**
     * The resource manager
     */
    protected static ResourceManager resources;

    static {
        bundle = ResourceBundle.getBundle(RESOURCES, Locale.getDefault());
        resources = new ResourceManager(bundle);
    }
    /**
     * The frame's icon.
     */
    protected static ImageIcon frameIcon = new ImageIcon(Main.class.getResource(resources.getString("Frame.icon")));
    /**
     * The preference manager.
     */
    protected XMLPreferenceManager preferenceManager;
    /**
     * Maximum number of recently visited URIs
     */
    public static final int MAX_VISITED_URIS = 10;
    /**
     * The array of last visited URIs
     */
    protected Vector lastVisited = new Vector();
    /**
     * The actual allowed maximum number of last visited URIs
     */
    protected int maxVisitedURIs = MAX_VISITED_URIS;
    /**
     * The arguments.
     */
    protected String[] arguments;
    /**
     * Controls whether the application can override the system security policy
     * property. This is done when there was no initial security policy
     * specified when the application started, in which case Batik will use that
     * property.
     */
    protected boolean overrideSecurityPolicy = true;
    /**
     * Script security enforcement is delegated to the security utility
     */
    protected ApplicationSecurityEnforcer securityEnforcer;
    /**
     * The option handlers.
     */
    protected Map handlers = new HashMap();

    {
        handlers.put("-font-size", new FontSizeHandler());
    }
    /**
     * The viewer frames.
     */
    protected static HashMap viewerFrames = new HashMap();
    protected static HashMap viewerFramesCaching = new HashMap();
    protected static JSVGViewerFrame viewerFrame;
    /**
     * The preference dialog.
     */
    protected PreferenceDialog preferenceDialog;

    /**
     * Creates a new application.
     *
     * @param args The command-line arguments.
     */
    public Main(String[] args) {
        Font font = getFont("tahoma.ttf", 16);
        FontUIResource fontRes = new FontUIResource(font);
        UIManager.put("PopupMenu.font", fontRes);
        UIManager.put("TextPane.font", fontRes);
        UIManager.put("MenuItem.font", fontRes);
        UIManager.put("ComboBox.font", fontRes);
        UIManager.put("Button.font", fontRes);
        UIManager.put("Tree.font", fontRes);
        UIManager.put("ScrollPane.font", fontRes);
        UIManager.put("TabbedPane.font", fontRes);
        UIManager.put("EditorPane.font", fontRes);
        UIManager.put("TitledBorder.font", fontRes);
        UIManager.put("Menu.font", fontRes);
        UIManager.put("TextArea.font", fontRes);
        UIManager.put("OptionPane.font", fontRes);
        UIManager.put("DesktopIcon.font", fontRes);
        UIManager.put("MenuBar.font", fontRes);
        UIManager.put("ToolBar.font", fontRes);
        UIManager.put("RadioButton.font", fontRes);
        UIManager.put("RadioButtonMenuItem.font", fontRes);
        UIManager.put("ToggleButton.font", fontRes);
        UIManager.put("ToolTip.font", fontRes);
        UIManager.put("ProgressBar.font", fontRes);
        UIManager.put("TableHeader.font", fontRes);
        UIManager.put("Panel.font", fontRes);
        UIManager.put("List.font", fontRes);
        UIManager.put("ColorChooser.font", fontRes);
        UIManager.put("PasswordField.font", fontRes);
        UIManager.put("TextField.font", fontRes);
        UIManager.put("Table.font", fontRes);
        UIManager.put("Label.font", fontRes);
        UIManager.put("InternalFrameTitlePane.font", fontRes);
        UIManager.put("CheckBoxMenuItem.font", fontRes);
        arguments = args;
        Map defaults = new HashMap(11);

        defaults.put(PreferenceDialog.PREFERENCE_KEY_LANGUAGES,
                Locale.getDefault().getLanguage());
        defaults.put(PreferenceDialog.PREFERENCE_KEY_SHOW_RENDERING,
                Boolean.FALSE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_AUTO_ADJUST_WINDOW,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_SELECTION_XOR_MODE,
                Boolean.FALSE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ENABLE_DOUBLE_BUFFERING,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_SHOW_DEBUG_TRACE,
                Boolean.FALSE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_PROXY_HOST,
                "");
        defaults.put(PreferenceDialog.PREFERENCE_KEY_PROXY_PORT,
                "");
        defaults.put(PreferenceDialog.PREFERENCE_KEY_CSS_MEDIA,
                "screen");
        defaults.put(PreferenceDialog.PREFERENCE_KEY_DEFAULT_FONT_FAMILY,
                DEFAULT_DEFAULT_FONT_FAMILY);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_IS_XML_PARSER_VALIDATING,
                Boolean.FALSE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ENFORCE_SECURE_SCRIPTING,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_GRANT_SCRIPT_FILE_ACCESS,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_GRANT_SCRIPT_NETWORK_ACCESS,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_LOAD_JAVA,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_LOAD_ECMASCRIPT,
                Boolean.TRUE);
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ALLOWED_SCRIPT_ORIGIN,
                new Integer(ResourceOrigin.DOCUMENT));
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ALLOWED_EXTERNAL_RESOURCE_ORIGIN,
                new Integer(ResourceOrigin.ANY));
        defaults.put(PREFERENCE_KEY_VISITED_URI_LIST,
                "");
        defaults.put(PREFERENCE_KEY_VISITED_URI_LIST_LENGTH,
                new Integer(MAX_VISITED_URIS));
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_MODE,
                new Integer(1));
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_CPU,
                new Float(0.75f));
        defaults.put(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_FPS,
                new Float(10));
        defaults.put(PreferenceDialog.PREFERENCE_KEY_USER_STYLESHEET_ENABLED,
                Boolean.TRUE);

        securityEnforcer = new ApplicationSecurityEnforcer(this.getClass(),
                SQUIGGLE_SECURITY_POLICY);

        try {
            preferenceManager = new XMLPreferenceManager(SQUIGGLE_CONFIGURATION_FILE,
                    defaults);
            String dir = System.getProperty(PROPERTY_USER_HOME);
            File f = new File(dir, BATIK_CONFIGURATION_SUBDIRECTORY);
            f.mkdir();
            XMLPreferenceManager.setPreferenceDirectory(f.getCanonicalPath());
            preferenceManager.load();
            setPreferences();
            initializeLastVisited();
            Authenticator.setDefault(new JAuthenticator());
        } catch (Exception e) {
            e.printStackTrace();
        }
        run();
    }

    private HashMap<String, Object> getCommandLineArgs(String[] args) {
        int c;
        String arg;
        String[] argv = null;
        String url = "";
        String backend = "localhost:5001";
        Long scrn = new Long(0);
        Long backClr = new Long(16777215);
        String loginPth = "";
        int maxargs = 5;

        HashMap<String, Object> res = new HashMap<String, Object>();
        if (args.length >= 1) {
            if (args[0].equals("-print")) {
                if (args.length == 2) {
                    argv = args[1].split(" ");
                }
            } else {
                argv = args;
            }
        } else {
            argv = new String[0];
        }
        LongOpt[] longopts = new LongOpt[maxargs];
        StringBuffer[] sb = new StringBuffer[maxargs];
        for (int i = 0; i < maxargs; i++) {
            sb[i] = new StringBuffer();
        }
        longopts[0] = new LongOpt("url", LongOpt.REQUIRED_ARGUMENT, sb[0], 'u');
        longopts[1] = new LongOpt("screen", LongOpt.REQUIRED_ARGUMENT, sb[1], 's');
        longopts[2] = new LongOpt("backend", LongOpt.REQUIRED_ARGUMENT, sb[2], 'b');
        longopts[3] = new LongOpt("backcolor", LongOpt.REQUIRED_ARGUMENT, sb[3], 'c');
        longopts[4] = new LongOpt("loginpath", LongOpt.REQUIRED_ARGUMENT, sb[4], 'p');

        Getopt g = new Getopt("hmi", argv, "", longopts);
        g.setOpterr(false);

        while ((c = g.getopt()) != -1) {
            switch (c) {
                case 0:
                    switch (g.getLongind()) {
                        case 0:
                            arg = g.getOptarg();
                            url = ((arg != null) ? arg : "");
                            break;
                        case 1:
                            arg = g.getOptarg();
                            scrn = ((arg != null) ? Long.parseLong(arg) : 0);
                            break;
                        case 2:
                            arg = g.getOptarg();
                            backend = ((arg != null) ? arg : "localhost:5001");
                            break;
                        case 3:
                            arg = g.getOptarg();
                            backClr = ((arg != null) ? Long.parseLong(arg) : 0);
                            break;
                        case 4:
                            arg = g.getOptarg();
                            loginPth = ((arg != null) ? arg : "C:/bf/temp/pwd.txt");
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        res.put("url", url);
        res.put("screen", scrn);
        res.put("backend", backend);
        res.put("backColor", backClr);
        res.put("loginPath", loginPth);
        return res;
    }

    /**
     * Installs a custom policy file in the '.batik' directory. This is
     * initialized with the content of the policy file coming with the
     * distribution
     */
    public void installCustomPolicyFile() throws IOException {
        String securityPolicyProperty = System.getProperty(PROPERTY_JAVA_SECURITY_POLICY);

        if (overrideSecurityPolicy
                || securityPolicyProperty == null
                || "".equals(securityPolicyProperty)) {
            String dir = System.getProperty(PROPERTY_USER_HOME);
            File batikConfigDir = new File(dir, BATIK_CONFIGURATION_SUBDIRECTORY);
            File policyFile = new File(batikConfigDir, SQUIGGLE_POLICY_FILE);
            Reader r = new BufferedReader(new InputStreamReader(Main.class.getResourceAsStream("resources/svgbrowser.policy")));
            Writer w = new FileWriter(policyFile);

            char[] buf = new char[1024];
            int n = 0;
            while ((n = r.read(buf, 0, buf.length)) != -1) {
                w.write(buf, 0, n);
            }

            r.close();

            boolean grantScriptNetworkAccess = true;
            boolean grantScriptFileAccess = true;

            if (grantScriptNetworkAccess) {
                w.write(POLICY_GRANT_SCRIPT_NETWORK_ACCESS);
            }

            if (grantScriptFileAccess) {
                w.write(POLICY_GRANT_SCRIPT_FILE_ACCESS);
            }

            w.close();

            overrideSecurityPolicy = true;

            System.setProperty(PROPERTY_JAVA_SECURITY_POLICY,
                    policyFile.toURL().toString());

        }
    }

    /**
     * Runs the application.
     */
    public void run() {
        HashMap<String, Object> cmdArgs = getCommandLineArgs(arguments);
        Main.startUrl = (String) cmdArgs.get("url");
        Long scrn = (Long) cmdArgs.get("screen");
        Main.screen = scrn.intValue();
        Main.backend = (String) cmdArgs.get("backend");
        Main.backgroundColor = ((Long) cmdArgs.get("backColor")).intValue();
        Main.loginPath = (String) cmdArgs.get("loginPath");
        String backends[] = backend.split(",");
        commClient = new CommClient[backends.length * 5];
        int i, j;
        for (i = backends.length - 1; i >= 0; i--) {
            commClient[i * 5 + 0] = new CommClient(backends[i], "Tags reader");
            commClient[i * 5 + 1] = new CommClient(backends[i], "Tags writer");
            commClient[i * 5 + 2] = new CommClient(backends[i], "Trends reader");
            commClient[i * 5 + 3] = new CommClient(backends[i], "Tags list reader");
            commClient[i * 5 + 4] = new CommClient(backends[i], "Alarms reader and writer");
            commClient[i * 5 + 3].setUpdateTagsList(true);
            commClient[i * 5 + 4].setUpdateAlarms(true);
            commClient[i * 5 + 0].connect();
            commClient[i * 5 + 1].connect();
            commClient[i * 5 + 2].connect();
            commClient[i * 5 + 3].connect();
            commClient[i * 5 + 4].connect();
        }
        try {
            Thread.sleep(5000);
        } catch (InterruptedException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        activeBackend = checkActiveBackend();
        tt = new TimerTask() {

            public void run() {
                activeBackend = checkActiveBackend();
            }
        };
        timer.schedule(tt, 1000, 1000);
        openLink(Main.startUrl, null);
    }

    /**
     * This interface represents an option handler.
     */
    protected interface OptionHandler {

        /**
         * Handles the current option.
         *
         * @return the index of argument just before the next one to handle.
         */
        int handleOption(int i);

        /**
         * Returns the option description.
         */
        String getDescription();
    }

    /**
     * To handle the '-font-size' option.
     */
    protected class FontSizeHandler implements OptionHandler {

        public int handleOption(int i) {
            int size = Integer.parseInt(arguments[++i]);

            Font font = new Font("Dialog", Font.PLAIN, size);
            FontUIResource fontRes = new FontUIResource(font);
            UIManager.put("CheckBox.font", fontRes);
            UIManager.put("PopupMenu.font", fontRes);
            UIManager.put("TextPane.font", fontRes);
            UIManager.put("MenuItem.font", fontRes);
            UIManager.put("ComboBox.font", fontRes);
            UIManager.put("Button.font", fontRes);
            UIManager.put("Tree.font", fontRes);
            UIManager.put("ScrollPane.font", fontRes);
            UIManager.put("TabbedPane.font", fontRes);
            UIManager.put("EditorPane.font", fontRes);
            UIManager.put("TitledBorder.font", fontRes);
            UIManager.put("Menu.font", fontRes);
            UIManager.put("TextArea.font", fontRes);
            UIManager.put("OptionPane.font", fontRes);
            UIManager.put("DesktopIcon.font", fontRes);
            UIManager.put("MenuBar.font", fontRes);
            UIManager.put("ToolBar.font", fontRes);
            UIManager.put("RadioButton.font", fontRes);
            UIManager.put("RadioButtonMenuItem.font", fontRes);
            UIManager.put("ToggleButton.font", fontRes);
            UIManager.put("ToolTip.font", fontRes);
            UIManager.put("ProgressBar.font", fontRes);
            UIManager.put("TableHeader.font", fontRes);
            UIManager.put("Panel.font", fontRes);
            UIManager.put("List.font", fontRes);
            UIManager.put("ColorChooser.font", fontRes);
            UIManager.put("PasswordField.font", fontRes);
            UIManager.put("TextField.font", fontRes);
            UIManager.put("Table.font", fontRes);
            UIManager.put("Label.font", fontRes);
            UIManager.put("InternalFrameTitlePane.font", fontRes);
            UIManager.put("CheckBoxMenuItem.font", fontRes);

            return i;
        }

        public String getDescription() {
            return resources.getString("Command.font-size");
        }
    }

    public static boolean isCached(String url) {
        return viewerFramesCaching.containsKey(url);
    }

    /**
     * Creates a new application exit action.
     */
    public Action createExitAction(JSVGViewerFrame vf) {
        return new AbstractAction() {

            public void actionPerformed(ActionEvent e) {
                System.exit(0);
            }
        };
    }

    /**
     * Closes the given viewer frame.
     */
    @Override
    public boolean closeJSVGViewerFrame(JSVGViewerFrame referer) {
        if (isSingleFramed == false) {
            boolean res = true;
            String currentURI = referer.getSVGCanvasURL();
            String url = "";
            URL u = null;
            try {
                u = new URL(currentURI);
                url = u.getPath();
            } catch (MalformedURLException ex) {
                Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
            }
//            referer.getJSVGCanvas().suspendProcessing();
            referer.setVisible(false);
            UrlHistory.pop();

            if (isCached(url)) {
                res = true;
            } else {
                res = false;
            }
            String oldURL = UrlHistory.pop();
            if (oldURL != null) {
                if (isCached(oldURL)) {
                    openLink(getActiveBackend() + oldURL, referer, true);
                } else {
                    openLink(getActiveBackend() + oldURL, referer, false);
                }
            }
            return res;
        } else {
            UrlHistory.pop();
            String oldURL = UrlHistory.pop();
            if (oldURL != null) {
                openLink(getActiveBackend() + oldURL, referer, true);
            }
            return true;
        }
    }

    @Override
    public void removeViewerFrame(String urlFull) {
        String url = "";
        URL u = null;
        try {
            u = new URL(urlFull);
            url = u.getPath();
        } catch (MalformedURLException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (isCached(url) == true) {
            viewerFramesCaching.remove(url);
        }
        viewerFrames.remove(url);
        UrlHistory.pop();
    }

    @Override
    public void openLink(String urlFull, JSVGViewerFrame referer) {
        openLink(urlFull, referer, true);
    }

    @Override
    public void openLinkWithParameters(String urlFull, JSVGViewerFrame referer, String initialScript) {
        openLinkWithParameters(urlFull, referer, true, initialScript);
    }

    @Override
    public void openLink(String urlFull, JSVGViewerFrame referer, final boolean isCaching) {
        openLinkWithParameters(urlFull, referer, isCaching, "");
    }

    @Override
    public void openLinkWithParameters(String urlFull, JSVGViewerFrame referer, final boolean isCaching, String initialScript) {
        String url = "";
        URL u = null;
        try {
            u = new URL(urlFull);
            url = u.getPath();
        } catch (MalformedURLException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        UrlHistory.push(url);
        if (isSingleFramed == true) {
            if (viewerFrame == null) {
                viewerFrame = new JSVGViewerFrame(this, initialScript);
                viewerFrame.setIconImage(frameIcon.getImage());
                viewerFrame.setTitle(url);
                setPreferences(viewerFrame);
                viewerFrame.setFullscreen(true);
                viewerFrame.loadSVGDocument(getActiveBackend() + url);
                viewerFrame.setVisible(true);
                viewerFrame.repaint();
            } else {
                viewerFrame.setTitle(url);
                viewerFrame.loadSVGDocument(getActiveBackend() + url);
            }
        } else {
            if (isCached(url) == true) {
                if (((JSVGViewerFrame) viewerFrames.get(url)).isVisible() == false) {
                    ((JSVGViewerFrame) viewerFrames.get(url)).setVisible(true);
//                    ((JSVGViewerFrame)viewerFrames.get(url)).getJSVGCanvas().resumeProcessing();
                    ((JSVGViewerFrame) viewerFrames.get(url)).setHideSize(false);
                    ((JSVGViewerFrame) viewerFrames.get(url)).executeScript(initialScript);
                    ((JSVGViewerFrame) viewerFrames.get(url)).repaint();
                    if (referer != null) {
                        referer.setHideSize(true);
//                        referer.getJSVGCanvas().suspendProcessing();
                        referer.setVisible(false);
                    }
                }
                return;
            }
            JSVGViewerFrame f = new JSVGViewerFrame(this, initialScript);
            f.setIconImage(frameIcon.getImage());
            f.setTitle(url);
            setPreferences(f);
            f.setFullscreen(true);
            viewerFrames.put(url, f);
            viewerFramesCaching.put(url, true);

            f.loadSVGDocument(getActiveBackend() + url);
            f.setVisible(true);
            f.repaint();
            if (referer != null) {
                referer.setHideSize(true);
//                referer.getJSVGCanvas().suspendProcessing();
                referer.setVisible(false);
            }
        }
        System.out.println("Loaded url: \'" + url + "\'.");
    }
//

    /**
     * Returns the XML parser class name.
     */
    public String getXMLParserClassName() {
        return XMLResourceDescriptor.getXMLParserClassName();
    }

    /**
     * Returns true if the XML parser must be in validation mode, false
     * otherwise.
     */
    public boolean isXMLParserValidating() {
        return preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_IS_XML_PARSER_VALIDATING);
    }

    /**
     * Shows the preference dialog.
     */
    public void showPreferenceDialog(JSVGViewerFrame f) {
        if (preferenceDialog == null) {
            preferenceDialog = new PreferenceDialog(f, preferenceManager);
        }
        if (preferenceDialog.showDialog() == PreferenceDialog.OK_OPTION) {
            try {
                preferenceManager.save();
                setPreferences();
            } catch (Exception e) {
            }
        }
    }

    private void setPreferences() throws IOException {
        Iterator it = viewerFrames.values().iterator();
        while (it.hasNext()) {
            setPreferences((JSVGViewerFrame) it.next());
        }

        System.setProperty("proxyHost", preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_PROXY_HOST));
        System.setProperty("proxyPort", preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_PROXY_PORT));

        installCustomPolicyFile();
        securityEnforcer.installSecurityManager();
        securityEnforcer.enforceSecurity(false);
//        System.out.println(System.getProperty(PROPERTY_JAVA_SECURITY_POLICY));

    }

    private void setPreferences(JSVGViewerFrame vf) {
        boolean db = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_ENABLE_DOUBLE_BUFFERING);
        boolean sr = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_SHOW_RENDERING);
        vf.getJSVGCanvas().setProgressivePaint(sr);
        boolean d = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_SHOW_DEBUG_TRACE);
        vf.setDebug(false);
        boolean aa = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_AUTO_ADJUST_WINDOW);
        vf.setAutoAdjust(aa);
        boolean dd = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_SELECTION_XOR_MODE);
        vf.getJSVGCanvas().setSelectionOverlayXORMode(dd);
        int al = preferenceManager.getInteger(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_MODE);
        if (al < 0 || al > 2) {
            al = 1;
        }
        al = 0;
        switch (al) {
            case 0: // none
                vf.getJSVGCanvas().setAnimationLimitingNone();
                break;
            case 1: { // %cpu
                float pc = preferenceManager.getFloat(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_CPU);
                if (pc <= 0f || pc > 1.0f) {
                    pc = 0.75f;
                }
                vf.getJSVGCanvas().setAnimationLimitingCPU(pc);
                break;
            }
            case 2: { // fps
                float fps = preferenceManager.getFloat(PreferenceDialog.PREFERENCE_KEY_ANIMATION_RATE_LIMITING_FPS);
                if (fps <= 0f) {
                    fps = 10f;
                }
                vf.getJSVGCanvas().setAnimationLimitingFPS(fps);
                break;
            }
        }
    }

    /**
     * Returns the user languages.
     */
    public String getLanguages() {
        String s = preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_LANGUAGES);
        return (s == null)
                ? Locale.getDefault().getLanguage()
                : s;
    }

    /**
     * Returns the user stylesheet uri.
     *
     * @return null if no user style sheet was specified.
     */
    public String getUserStyleSheetURI() {
        boolean enabled = preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_USER_STYLESHEET_ENABLED);
        String ssPath = preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_USER_STYLESHEET);
        if (!enabled || ssPath.length() == 0) {
            return null;
        }
        try {
            File f = new File(ssPath);
            if (f.exists()) {
                return f.toURL().toString();
            }
        } catch (IOException ioe) {
            // Nothing...
        }
        return ssPath;
    }

    /**
     * Returns the default value for the CSS "font-family" property
     */
    public String getDefaultFontFamily() {
        return preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_DEFAULT_FONT_FAMILY);
    }

    /**
     * Returns the CSS media to use.
     *
     * @return empty string if no CSS media was specified.
     */
    public String getMedia() {
        String s = preferenceManager.getString(PreferenceDialog.PREFERENCE_KEY_CSS_MEDIA);
        return (s == null) ? "screen" : s;
    }

    /**
     * Returns true if the selection overlay is painted in XOR mode, false
     * otherwise.
     */
    public boolean isSelectionOverlayXORMode() {
        return preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_SELECTION_XOR_MODE);
    }

    /**
     * Returns true if the input scriptType can be loaded in this application.
     */
    public boolean canLoadScriptType(String scriptType) {
        if (SVGConstants.SVG_SCRIPT_TYPE_ECMASCRIPT.equals(scriptType)
                || SVGConstants.SVG_SCRIPT_TYPE_APPLICATION_ECMASCRIPT.equals(scriptType)
                || SVGConstants.SVG_SCRIPT_TYPE_JAVASCRIPT.equals(scriptType)
                || SVGConstants.SVG_SCRIPT_TYPE_APPLICATION_JAVASCRIPT.equals(scriptType)) {
            return preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_LOAD_ECMASCRIPT);
        } else if (SVGConstants.SVG_SCRIPT_TYPE_JAVA.equals(scriptType)) {
            return preferenceManager.getBoolean(PreferenceDialog.PREFERENCE_KEY_LOAD_JAVA);
        } else {
            return preferenceManager.getBoolean(scriptType + UNKNOWN_SCRIPT_TYPE_LOAD_KEY_EXTENSION);
        }
    }

    /**
     * Returns the allowed origins for scripts.
     *
     * @see ResourceOrigin
     */
    public int getAllowedScriptOrigin() {
        int ret = preferenceManager.getInteger(PreferenceDialog.PREFERENCE_KEY_ALLOWED_SCRIPT_ORIGIN);

        return ret;
    }

    /**
     * Returns the allowed origins for external resources.
     *
     * @see ResourceOrigin
     */
    public int getAllowedExternalResourceOrigin() {
        int ret = preferenceManager.getInteger(PreferenceDialog.PREFERENCE_KEY_ALLOWED_EXTERNAL_RESOURCE_ORIGIN);

        return ret;
    }

    /**
     * Notifies Application of recently visited URI
     */
    public void addVisitedURI(String uri) {

        int maxVisitedURIs =
                preferenceManager.getInteger(PREFERENCE_KEY_VISITED_URI_LIST_LENGTH);

        if (maxVisitedURIs < 0) {
            maxVisitedURIs = 0;
        }

        if (lastVisited.contains(uri)) {
            lastVisited.removeElement(uri);
        }

        while (lastVisited.size() > 0 && lastVisited.size() > (maxVisitedURIs - 1)) {
            lastVisited.removeElementAt(0);
        }

        if (maxVisitedURIs > 0) {
            lastVisited.addElement(uri);
        }

        // Now, save the list of visited URL into the preferences
        StringBuffer lastVisitedBuffer = new StringBuffer(lastVisited.size() * 8);

        for (int i = 0; i < lastVisited.size(); i++) {
            lastVisitedBuffer.append(URLEncoder.encode(lastVisited.get(i).toString()));
            lastVisitedBuffer.append(URI_SEPARATOR);
        }

        preferenceManager.setString(PREFERENCE_KEY_VISITED_URI_LIST,
                lastVisitedBuffer.toString());

        try {
            preferenceManager.save();
        } catch (Exception e) {
            // As in other places. But this is ugly...
        }
    }

    /**
     * Asks Application for a list of recently visited URI.
     */
    public String[] getVisitedURIs() {
        String[] visitedURIs = new String[lastVisited.size()];
        lastVisited.toArray(visitedURIs);
        return visitedURIs;
    }

    /**
     * Initializes the lastVisited array
     */
    protected void initializeLastVisited() {
        String lastVisitedStr = preferenceManager.getString(PREFERENCE_KEY_VISITED_URI_LIST);

        StringTokenizer st = new StringTokenizer(lastVisitedStr,
                URI_SEPARATOR);

        int n = st.countTokens();

        int maxVisitedURIs = preferenceManager.getInteger(PREFERENCE_KEY_VISITED_URI_LIST_LENGTH);

        if (n > maxVisitedURIs) {
            n = maxVisitedURIs;
        }

        for (int i = 0; i < n; i++) {
            lastVisited.addElement(URLDecoder.decode(st.nextToken()));
        }
    }

    public static int[] selectDate(int year, int month, int day, String title) {
        Timestamp tmp = new Timestamp(year, month, day, 0, 0, 0);
        DateChooserDialog dateDialog = new DateChooserDialog(null, true, title);
        JSVGViewerFrame frm = null;
        if (isSingleFramed == true) {
            frm = viewerFrame;
        } else {
            Collection frms = viewerFrames.values();
            Iterator iterator = frms.iterator();
            frm = null;
            while (iterator.hasNext() == true) {
                frm = (JSVGViewerFrame) iterator.next();
                if (frm.isVisible()) {
                    break;
                }
            }
        }
        if (frm != null) {
            Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
            Point p = new Point(screen * size.width + size.width / 2, size.height / 2);
            dateDialog.setLocation(p);
            dateDialog.setLocationRelativeTo(frm.getRootPane());
            Calendar cal = dateDialog.getResult(tmp.getCalendar());
            if (!(cal == null)) {
                tmp = new Timestamp(cal);
                tmp.setHour(0);
                tmp.setMinute(0);
                tmp.setSecond(0);
                int y = tmp.getYear();
                int m = tmp.getMonth();
                int d = tmp.getDay();
                int[] res = {y, m, d};
                return res;
            }
        }
        return null;
    }

    public static int[] selectDatetime(int year, int month, int day, int hour, int minute, int second, String title) {
        Timestamp tmp = new Timestamp(year, month, day, hour, minute, second);
        DateChooserDialog dateDialog = new DateChooserDialog(null, true, title);
        JSVGViewerFrame frm = null;
        if (isSingleFramed == true) {
            frm = viewerFrame;
        } else {
            Collection frms = viewerFrames.values();
            Iterator iterator = frms.iterator();
            frm = null;
            while (iterator.hasNext() == true) {
                frm = (JSVGViewerFrame) iterator.next();
                if (frm.isVisible()) {
                    break;
                }
            }
        }
        if (frm != null) {
            Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
            Point p = new Point(screen * size.width + size.width / 2, size.height / 2);
            dateDialog.setLocation(p);
            dateDialog.setLocationRelativeTo(frm.getRootPane());
            Calendar cal = dateDialog.getResult(tmp.getCalendar());
            if (!(cal == null)) {
                tmp = new Timestamp(cal);
                int y = tmp.getYear();
                int m = tmp.getMonth();
                int d = tmp.getDay();
                int hr = tmp.getHour();
                int mn = tmp.getMinute();
                int sc = tmp.getSecond();
                int[] res = {y, m, d, hr, mn, sc};
                return res;
            }
        }
        return null;
    }

    public static void exitApp() {
        System.exit(0);
    }

    public static float[] getMemoryUsage() {
        float[] result = new float[10];
        ArrayList<MemoryPoolMXBean> pools = (ArrayList<MemoryPoolMXBean>) ManagementFactory.getMemoryPoolMXBeans();
        for (MemoryPoolMXBean pool : pools) {
            MemoryUsage mem = pool.getUsage();
            if ("Code Cache".equals(pool.getName())) {
                result[0] = mem.getUsed();
                result[1] = mem.getCommitted();
            } else if ("Par Eden Space".equals(pool.getName())) {
                result[2] = mem.getUsed();
                result[3] = mem.getCommitted();
            } else if ("Par Survivor Space".equals(pool.getName())) {
                result[4] = mem.getUsed();
                result[5] = mem.getCommitted();
            } else if ("CMS Old Gen".equals(pool.getName())) {
                result[6] = mem.getUsed();
                result[7] = mem.getCommitted();
            } else if ("CMS Perm Gen".equals(pool.getName())) {
                result[8] = mem.getUsed();
                result[9] = mem.getCommitted();
            }
        }
        return result;
    }

    public static String getActiveBackend() {
        return activeBackend;
    }

    private static String checkActiveBackend() {
        if (selectedBackend == "") {
            String backends[] = backend.split(",");
            int i;
            for (i = 0; i < backends.length; i++) {
                if (commClient[i * 5 + 0].isConnected()) {
                    if (new String("http://" + backends[i] + "/").equals(lastBackend)==false) {
                        System.out.println("Backend changed from "+lastBackend+" to "+"http://" + backends[i] + "/");
                    }
                    lastBackend = "http://" + backends[i] + "/";
                    return "http://" + backends[i];
                }
            }
            if (new String("http://" + backends[0] + "/").equals(lastBackend)==false) {
                System.out.println("Backend changed from "+lastBackend+" to "+"http://" + backends[0] + "/");
            }
            lastBackend = "http://" + backends[0] + "/";
            return "http://" + backends[0];
        } else {
            if (new String("http://" + selectedBackend + "/").equals(lastBackend)==false) {
                System.out.println("Backend changed from "+lastBackend+" to "+"http://" + selectedBackend + "/");
            }
            lastBackend = "http://" + selectedBackend + "/";
            return "http://" + selectedBackend;
        }
    }

    public static String getSelectedBackend() {
        return Main.selectedBackend;
    }

    public static void setSelectedBackend(String backend) {
        selectedBackend = backend;
        checkActiveBackend();
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

    public static void execute_async(String commandName, JSONObject commandArgs, Callback callback) throws JSONException {
        CommClient cc = getActiveCommClient(0);
        if (cc != null) {
            cc.execute_async(commandName, commandArgs, callback);
        }
    }

    public static void execute_async3(String commandName, JSONObject commandArgs, Callback callback) throws JSONException {
        CommClient cc = getActiveCommClient(2);
        if (cc != null) {
            cc.execute_async(commandName, commandArgs, callback);
        }
    }

    public static void execute_async_js(String commandName, NativeObject commandArgs, Function callback) throws JSONException {
        CommClient cc = getActiveCommClient(0);
        if (cc != null) {
            cc.execute_async_js(commandName, commandArgs, callback);
        }
    }

    public static void execute_async_js2(String commandName, NativeObject commandArgs, Function callback) throws JSONException {
        CommClient cc = getActiveCommClient(1);
        if (cc != null) {
            cc.execute_async_js(commandName, commandArgs, callback);
        }
    }

    public static void execute_async_js3(String commandName, NativeObject commandArgs, Function callback) throws JSONException {
        CommClient cc = getActiveCommClient(2);
        if (cc != null) {
            cc.execute_async_js(commandName, commandArgs, callback);
        }
    }

    public static Object getAlarmMessages() {
        CommClient cc = getActiveCommClient(4);
        if (cc != null) {
            return cc.getAlarmMessages();
        }
        return "";

    }

    public static Object getTagsList() {
        CommClient cc = getActiveCommClient(3);
        if (cc != null) {
            return cc.getTagsList();
        }
        return "";
    }

    private static CommClient getActiveCommClient(int type) {
        String backends[] = backend.split(",");
        int i;
        if ("".equals(selectedBackend)) {
            for (i = 0; i < backends.length; i++) {
                if (commClient[i * 5 + type].isConnected() == true) {
                    return commClient[i * 5 + type];
                }
            }
            return null;
        } else {
            for (i = 0; i < backends.length; i++) {
                if (selectedBackend.equals(backends[i])) {
                    return commClient[i * 5 + type];
                }
            }
            return null;
        }

    }

    public static boolean getBoolTag(String tagName, String commID) {
        Object res = getTag(tagName, commID);
        if (res == null) {
            return false;
        }
        if (res instanceof Boolean) {
            return ((Boolean) res).booleanValue();
        }
        if (res instanceof Integer) {
            if (((Integer) res).intValue() == 1) {
                return true;
            } else {
                return false;
            }

        }
        if (res instanceof String) {
            if (("true".equals(res)) || ("TRUE".equals(res))) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public static double getFltTag(String tagName, String commID) {
        Object res = getTag(tagName, commID);
        if (res == null) {
            return 0.0;
        }
        if (res instanceof Double) {
            return ((Double) res).doubleValue();
        } else if (res instanceof Long) {
            return ((Long) res).doubleValue();
        } else if (res instanceof Integer) {
            return ((Integer) res).doubleValue();
        }
        return 0.0;
    }

    public static String getStrTag(String tagName, String commID) {
        Object res = getTag(tagName, commID);
        if (res == null) {
            return "";
        }

        if (res instanceof String) {
            return (String) res;
        }
        return "";
    }

    private static Object getTag(String tagName, String commID) {
        String commIDString=getCommID(commID);
//        System.out.println("getTag started: " + tagName + ", " + commIDString);
        String name = tagName.toString();
        String[] parts = name.split("\\.");
        Object res = null;
        CommClient cc = getActiveCommClient(0);
        if (cc != null) {
            if (parts.length == 1) {
                res = cc.getTagField(parts[0], "F_CV", commIDString);
            } else if (parts.length == 2) {
                res = cc.getTagField(parts[0], parts[1], commIDString);
            }
        }
//        System.out.println("getTag finished: " + tagName + ", " + commIDString);
        return res;
    }

    public static void log(String message) {
        Date ts = new Date();
        System.out.println(message + ", " + String.valueOf(ts.getTime() - lastLog.getTime()));
        lastLog = ts;
    }

    private class DocumentState extends CleanerThread.SoftReferenceCleared {

        private String uri;
        private DocumentDescriptor desc;

        public DocumentState(String uri,
                Document document,
                DocumentDescriptor desc) {
            super(document);
            this.uri = uri;
            this.desc = desc;
        }

        public void cleared() {
            synchronized (cacheMap) {
                cacheMap.remove(uri);
            }
        }

        public DocumentDescriptor getDocumentDescriptor() {
            return desc;
        }

        public String getURI() {
            return uri;
        }

        public Document getDocument() {
            return (Document) get();
        }
    }

    public static Document checkCache(String uri) {
        int n = uri.lastIndexOf('/');
        if (n == -1) {
            n = 0;
        }
        n = uri.indexOf('#', n);
        if (n != -1) {
            uri = uri.substring(0, n);
        }
        Document document;
        synchronized (cacheMap) {
            document = (Document) cacheMap.get(uri);
        }
        if (document != null) {
            return document;
        }
        return null;
    }

    public static Document putInCache(Object uri, Document document) {
        synchronized (cacheMap) {
            cacheMap.put(uri, document);
        }
        return checkCache((String) uri);
    }

    public static void clearCache() {
        synchronized (cacheMap) {
            cacheMap.clear();
        }
    }

    public static boolean isSingleFramedApp() {
        return isSingleFramed;
    }

    public static boolean isVisibleFrame(String documentURI) {
        return ((JSVGViewerFrame) viewerFrames.get(getCommID(documentURI))).isVisible();
    }

    public static String getCommID(String documentURI) {
        String url = "";
        URL u = null;
        try {
            u = new URL(documentURI);
            url = u.getPath();
            return url;
        } catch (MalformedURLException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
            return "";
        }
    }

    
}
