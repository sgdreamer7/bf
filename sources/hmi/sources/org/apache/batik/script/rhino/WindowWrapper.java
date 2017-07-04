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

package org.apache.batik.script.rhino;

import com.Ostermiller.util.PasswordDialog;
import com.cmas.hmi.Main;
import java.awt.AWTException;
import java.awt.Dimension;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import org.apache.batik.script.Window;
import org.mozilla.javascript.*;
import org.w3c.dom.Document;

/**
 * This class wraps a Window object to expose it to the interpreter.
 * This will be the Global Object of our interpreter.
 *
 * @author <a href="mailto:cjolif@ilog.fr">Christophe Jolif</a>
 * @author <a href="mailto:stephane@hillion.org">Stephane Hillion</a>
 * @version $Id: WindowWrapper.java 478188 2006-11-22 15:19:17Z dvholten $
 */
public class WindowWrapper extends ImporterTopLevel {

    private static final Object[] EMPTY_ARGUMENTS = new Object[0];

    /**
     * The rhino interpreter.
     */
    protected RhinoInterpreter interpreter;

    /**
     * The wrapped window.
     */
    protected Window window;

    /**
     * Creates a new WindowWrapper.
     */
    public WindowWrapper(Context context) {
        super(context);
        String[] names = { "setInterval", "setTimeout", "clearInterval",
                           "clearTimeout", "parseXML", "getURL", "postURL",
                           "alert", "confirm", "prompt", 
                           "openURL","openURLWithParameters", "close",
                           "print", "popupMenu", "evaluateScript",
                           "shutdown","password","login",
                           "addKeyAction", "isVisibleFrame" //,"immediateGetURL","immediatePostURL"
        };
        this.defineFunctionProperties(names, WindowWrapper.class,
                                      ScriptableObject.DONTENUM);
        
    }

    public String getClassName() {
        return "Window";
    }

    public String toString() {
        return "[object Window]";
    }

    public static Object isVisibleFrame(Context cx,
                                     Scriptable thisObj,
                                     Object[] args,
                                     Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;

        if (len < 1) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        String documentURI = ((String)Context.jsToJava(args[0], String.class));
        return Context.javaToJS(Main.isVisibleFrame(documentURI),thisObj);
    }
    
    public static void addKeyAction(Context cx,
                                     Scriptable thisObj,
                                     Object[] args,
                                     Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;

        if (len < 3) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        long key = ((Long)Context.jsToJava(args[1], Long.TYPE)).longValue();
        long mask = ((Long)Context.jsToJava(args[2], Long.TYPE)).longValue();
        if (args[0] instanceof Function) {
            RhinoInterpreter interp =
                (RhinoInterpreter)window.getInterpreter();
            FunctionWrapper fw;
            fw = new FunctionWrapper(interp, (Function)args[0],
                                     EMPTY_ARGUMENTS);
            window.addKeyAction(fw,key,mask);
        }
        return;
    }
    
    /**
     * Wraps the 'setInterval' methods of the Window interface.
     */
    public static Object setInterval(Context cx,
                                     Scriptable thisObj,
                                     Object[] args,
                                     Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;

        if (len < 2) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        long to = ((Long)Context.jsToJava(args[1], Long.TYPE)).longValue();
        if (args[0] instanceof Function) {
            RhinoInterpreter interp =
                (RhinoInterpreter)window.getInterpreter();
            FunctionWrapper fw;
            fw = new FunctionWrapper(interp, (Function)args[0],
                                     EMPTY_ARGUMENTS);
            return Context.toObject(window.setInterval(fw, to), thisObj);
        }
        String script =
            (String)Context.jsToJava(args[0], String.class);
        return Context.toObject(window.setInterval(script, to), thisObj);
    }
    
    

    /**
     * Wraps the 'setTimeout' methods of the Window interface.
     */
    public static Object setTimeout(Context cx,
                                    Scriptable thisObj,
                                    Object[] args,
                                    Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len < 2) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        long to = ((Long)Context.jsToJava(args[1], Long.TYPE)).longValue();
        if (args[0] instanceof Function) {
            RhinoInterpreter interp =
                (RhinoInterpreter)window.getInterpreter();
            FunctionWrapper fw;
            fw = new FunctionWrapper(interp, (Function)args[0],
                                     EMPTY_ARGUMENTS);
            return Context.toObject(window.setTimeout(fw, to), thisObj);
        }
        String script =
            (String)Context.jsToJava(args[0], String.class);
        return Context.toObject(window.setTimeout(script, to), thisObj);
    }

    /**
     * Wraps the 'clearInterval' method of the Window interface.
     */
    public static void clearInterval(Context cx,
                                     Scriptable thisObj,
                                     Object[] args,
                                     Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 1) {
            window.clearInterval(Context.jsToJava(args[0], Object.class));
        }
    }

    /**
     * Wraps the 'clearTimeout' method of the Window interface.
     */
    public static void clearTimeout(Context cx,
                                    Scriptable thisObj,
                                    Object[] args,
                                    Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 1) {
            window.clearTimeout(Context.jsToJava(args[0], Object.class));
        }
    }

    /**
     * Wraps the 'parseXML' method of the Window interface.
     */
    public static Object parseXML(Context cx,
                                  Scriptable thisObj,
                                  final Object[] args,
                                  Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        final Window window = ww.window;
        if (len < 2) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }

        AccessControlContext acc =
            ((RhinoInterpreter)window.getInterpreter()).getAccessControlContext();

        Object ret = AccessController.doPrivileged( new PrivilegedAction() {
                public Object run() {
                    return window.parseXML
                        ((String)Context.jsToJava(args[0], String.class),
                         (Document)Context.jsToJava(args[1], Document.class));
                }
            }, acc);
        return Context.toObject(ret, thisObj);
    }

    /**
     * Wraps the 'getURL' method of the Window interface.
     */
    public static void getURL(Context cx,
                              Scriptable thisObj,
                              final Object[] args,
                              Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        final Window window = ww.window;
        if (len < 2) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        RhinoInterpreter interp =
            (RhinoInterpreter)window.getInterpreter();
        final String uri = (String)Context.jsToJava(args[0], String.class);
        Window.URLResponseHandler urlHandler = null;
        if (args[1] instanceof Function) {
            urlHandler = new GetURLFunctionWrapper
                (interp, (Function)args[1], ww);
        } else {
            urlHandler = new GetURLObjectWrapper
                (interp, (NativeObject)args[1], ww);
        }
        final Window.URLResponseHandler fw = urlHandler;

        AccessControlContext acc =
            ((RhinoInterpreter)window.getInterpreter()).getAccessControlContext();

        if (len == 2) {
            AccessController.doPrivileged(new PrivilegedAction() {
                    public Object run(){
                        window.getURL(uri, fw);
                        return null;
                    }
                }, acc);
        } else {
            AccessController.doPrivileged(new PrivilegedAction() {
                    public Object run() {
                        window.getURL
                            (uri, fw,
                             (String)Context.jsToJava(args[2], String.class));
                        return null;
                    }
                }, acc);
        }
    }

    /**
     * Wraps the 'postURL' method of the Window interface.
     */
    public static void postURL(Context cx,
                               Scriptable thisObj,
                               final Object[] args,
                               Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        final Window window = ww.window;
        if (len < 3) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        RhinoInterpreter interp =
            (RhinoInterpreter)window.getInterpreter();
        final String uri     = (String)Context.jsToJava(args[0], String.class);
        final String content = (String)Context.jsToJava(args[1], String.class);
        Window.URLResponseHandler urlHandler = null;
        if (args[2] instanceof Function) {
            urlHandler = new GetURLFunctionWrapper
                (interp, (Function)args[2], ww);
        } else {
            urlHandler = new GetURLObjectWrapper
                (interp, (NativeObject)args[2], ww);
        }
        final Window.URLResponseHandler fw = urlHandler;

        AccessControlContext acc;
        acc = interp.getAccessControlContext();

        switch (len) {
        case 3:
            AccessController.doPrivileged(new PrivilegedAction() {
                    public Object run(){
                        window.postURL(uri, content, fw);
                        return null;
                    }
                }, acc);
            break;
        case 4:
            AccessController.doPrivileged(new PrivilegedAction() {
                    public Object run() {
                        window.postURL
                            (uri, content, fw,
                             (String)Context.jsToJava(args[3], String.class));
                        return null;
                    }
                }, acc);
            break;
        default:
            AccessController.doPrivileged(new PrivilegedAction() {
                    public Object run() {
                        window.postURL
                            (uri, content, fw,
                             (String)Context.jsToJava(args[3], String.class),
                             (String)Context.jsToJava(args[4], String.class));
                        return null;
                    }
                }, acc);
        }
    }
    
//    public static Object immediateGetURL(Context cx,
//                               Scriptable thisObj,
//                               final Object[] args,
//                               Function funObj) {
//        try {
//            int len = args.length;
//            if (len < 1) {
//                throw Context.reportRuntimeError("неправильное количество аргументов");
//            }
//            final String uri = (String)Context.jsToJava(args[0], String.class);
//            
//            DefaultHttpClient httpClient=new DefaultHttpClient();
//            HttpParams params=httpClient.getParams();
//            HttpConnectionParams.setSoReuseaddr(params, true);
//            HttpConnectionParams.setLinger(params, 0);
//            HttpConnectionParams.setSoKeepalive(params, true);
//            HttpConnectionParams.setTcpNoDelay(params, true);
//            httpClient.setParams(params);
//            
//            HttpGet httpget=new HttpGet(uri);
//            HttpResponse response=httpClient.execute(httpget);
//            BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent(),"UTF-8"));
//            final StringBuffer sb = new StringBuffer();
//            int read;
//            char[] buf = new char[4096];
//            while ((read = rd.read(buf, 0, buf.length)) != -1) {
//                sb.append(buf, 0, read);
//            }
//            rd.close();
//            return Context.toObject(sb.toString(),thisObj);
//        } catch (IOException ex) {
//            System.out.println((String)Context.jsToJava(args[0], String.class));
//            Logger.getLogger(WindowWrapper.class.getName()).log(Level.SEVERE, null, ex);
//        }
//        return null;
//    }
//    
//    public static Object immediatePostURL(Context cx,
//                               Scriptable thisObj,
//                               final Object[] args,
//                               Function funObj) {
//        try {
//            int len = args.length;
//            if (len < 2) {
//                throw Context.reportRuntimeError("неправильное количество аргументов");
//            }
//            final String uri     = (String)Context.jsToJava(args[0], String.class);
//            final String content = (String)Context.jsToJava(args[1], String.class);
//
//            DefaultHttpClient httpClient=new DefaultHttpClient();
//            HttpParams params=httpClient.getParams();
//            HttpConnectionParams.setSoReuseaddr(params, true);
//            HttpConnectionParams.setLinger(params, 0);
//            HttpConnectionParams.setSoKeepalive(params, true);
//            HttpConnectionParams.setTcpNoDelay(params, true);
//            httpClient.setParams(params);
//            
//            HttpPost httppost=new HttpPost(uri);
//            httppost.setEntity(new StringEntity(content,"UTF-8"));
//            HttpResponse response=httpClient.execute(httppost);
//            BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent(),"UTF-8"));
//            final StringBuffer sb = new StringBuffer();
//            int read;
//            char[] buf = new char[4096];
//            while ((read = rd.read(buf, 0, buf.length)) != -1) {
//                sb.append(buf, 0, read);
//            }
//            rd.close();
//            return Context.toObject(sb.toString(),thisObj);
//        } catch (IOException ex) {
//            Logger.getLogger(WindowWrapper.class.getName()).log(Level.SEVERE, null, ex);
//            System.out.println((String)Context.jsToJava(args[0], String.class));
//            System.out.println((String)Context.jsToJava(args[1], String.class));
//        }
//        return null;
//    }

    public static void popupMenu(Context cx,
                               Scriptable thisObj,
                               final Object[] args,
                               Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        final Window window = ww.window;
        if (len != 2) {
            throw Context.reportRuntimeError("неправильное количество аргументов");
        }
        RhinoInterpreter interp =(RhinoInterpreter)window.getInterpreter();
        Window.PopupMenuHandler popupHandler = null;
        if (args[1] instanceof Function) {
            popupHandler = new PopupMenuFunctionWrapper
                (interp, (Function)args[1], ww);
        } else {
            popupHandler = new PopupMenuObjectWrapper
                (interp, (NativeObject)args[1], ww);
        }
        final Window.PopupMenuHandler fw = popupHandler;

        AccessControlContext acc;
        acc = interp.getAccessControlContext();
        Scriptable obj = (Scriptable)args[0];
        final JMenu menu=getMenu(obj,fw);
        AccessController.doPrivileged(new PrivilegedAction() {
            public Object run() {
                window.showPopupMenu(menu.getPopupMenu());
                return null;
            }
        }, acc);
    }


    private static JMenu getMenu(Scriptable obj,final Window.PopupMenuHandler fw) {
        JMenu menu=new JMenu();
        if(obj != null) {
            if (obj instanceof NativeArray) {
                NativeArray arr=(NativeArray)obj;
                for(int i=0; i< arr.getLength(); i++) {
                    NativeObject elem=(NativeObject)arr.get(i, null);
                    String menuItemText=(String)NativeObject.getProperty(elem, "text");
                    Object submenuObj=NativeObject.getProperty(elem, "submenu");
                    if (submenuObj instanceof NativeArray) {
                        JMenu submenu=getMenu((NativeArray)submenuObj,fw);
                        submenu.setText(menuItemText);
                        menu.add(submenu);
                    } else {
                        final String menuItemId=(String)NativeObject.getProperty(elem, "id");
                        JMenuItem item=new JMenuItem(menuItemText);
                        item.addActionListener(
                            new ActionListener(){

                                @Override
                                public void actionPerformed(ActionEvent e) {
                                    fw.menuSelected(menuItemId);
                                }
                            }
                       );
                       menu.add(item);
                    }
                }
            }
        }
        return menu;
    }

//    public static void setFullscreen(Context cx,
//                             Scriptable thisObj,
//                             Object[] args,
//                             Function funObj) {
//        int len = args.length;
//        WindowWrapper ww = (WindowWrapper)thisObj;
//        Window window = ww.window;
//        if (len >= 1) {
//            Boolean fullscreen =
//                (Boolean)Context.jsToJava(args[0], Boolean.class);
//            window.setFullscreen(fullscreen.booleanValue());
//        }
//    }

//    public static void closeWindow(Context cx,
//                             Scriptable thisObj,
//                             Object[] args,
//                             Function funObj) {
//        int len = args.length;
//        WindowWrapper ww = (WindowWrapper)thisObj;
//        Window window = ww.window;
//        if (len >= 0) {
//            window.closeWindow();
//        }
//    }
    
    public static void shutdown(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        if (len == 0) {
            System.exit(0);
        }
    }
    
    public static void evaluateScript(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 1) {
            String script =
                (String)Context.jsToJava(args[0], String.class);
           cx.evaluateString(thisObj, script, "", 0, null);
        }
    }
    
    public static void openURL(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 2) {
            String url =
                (String)Context.jsToJava(args[0], String.class);
            Boolean newwindow =
                (Boolean)Context.jsToJava(args[1], Boolean.class);
            window.openURL(url,newwindow.booleanValue());
        }
    }

    public static void openURLWithParameters(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 3) {
            String url =
                (String)Context.jsToJava(args[0], String.class);
            Boolean newwindow =
                (Boolean)Context.jsToJava(args[1], Boolean.class);
            String initialScript =
                (String)Context.jsToJava(args[2], String.class);
            window.openURLWithParameters(url,newwindow.booleanValue(),initialScript);
        }
    }
    
    public static void close(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        final Window window = ww.window;
        if (len ==0) {
            window.closeWindow();
        }
    }

    /**
     * Wraps the 'alert' method of the Window interface.
     */
    public static void alert(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 1) {
            String message =
                (String)Context.jsToJava(args[0], String.class);
            window.alert(message);
        }
    }
    
    public static Object login(Context cx,
                                  Scriptable thisObj,
                                  Object[] args,
                                  Function funObj) {
        int len = args.length;
        if (len >= 3) {
            String filename = (String)Context.jsToJava(args[0], String.class);
            String str = (String)Context.jsToJava(args[1], String.class);
            Integer keycode=(Integer)Context.jsToJava(args[2], Integer.class);
            BufferedWriter out;
            try {
                out = new BufferedWriter(new FileWriter(filename));
                out.write(str);
                out.close();
            } catch (IOException ex) {
                Logger.getLogger(WindowWrapper.class.getName()).log(Level.SEVERE, null, ex);
            }   
            try {
                Robot robot=new Robot();
                robot.keyPress(keycode.intValue());
            } catch (AWTException ex) {
                Logger.getLogger(WindowWrapper.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return Context.toObject(Boolean.FALSE, thisObj);
    }

    /**
     * Wraps the 'confirm' method of the Window interface.
     */
    public static Object confirm(Context cx,
                                  Scriptable thisObj,
                                  Object[] args,
                                  Function funObj) {
        int len = args.length;
        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        if (len >= 1) {
            String message =
                (String)Context.jsToJava(args[0], String.class);
            if (window.confirm(message))
                return Context.toObject(Boolean.TRUE, thisObj);
            else
                return Context.toObject(Boolean.FALSE, thisObj);
        }
        return Context.toObject(Boolean.FALSE, thisObj);
    }
    

    /**
     * Wraps the 'prompt' method of the Window interface.
     */
    public static Object prompt(Context cx,
                                Scriptable thisObj,
                                Object[] args,
                                Function funObj) {

        WindowWrapper ww = (WindowWrapper)thisObj;
        Window window = ww.window;
        Object result;
        switch (args.length) {
            case 0:
                result = "";
                break;
            case 1:
                String message =
                    (String)Context.jsToJava(args[0], String.class);
                result = window.prompt(message);
                break;
            default:
                message =
                    (String)Context.jsToJava(args[0], String.class);
                String defVal =
                    (String)Context.jsToJava(args[1], String.class);
                result = window.prompt(message, defVal);
                break;
        }

        if (result == null) {
            return null;
        }
        return Context.toObject(result, thisObj);
    }

    public static Object password(Context cx,
                                Scriptable thisObj,
                                Object[] args,
                                Function funObj) {

        Object result;
        switch (args.length) {
            case 0:
                result = "";
                break;
            case 1:
                String message =
                    (String)Context.jsToJava(args[0], String.class);
                PasswordDialog pd = new PasswordDialog(null, message);
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
                    result=pd.getName()+"\n"+pd.getPass();
                } else {
                    result="";
                }
                
                break;
            default:
                result = "";
                break;
        }

        if (result == null) {
            return null;
        }
        return Context.toObject(result, thisObj);
    }
    
             
    public static void print(Context cx,
                             Scriptable thisObj,
                             Object[] args,
                             Function funObj) throws UnsupportedEncodingException {
        StringBuilder sb=new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0) {
                sb.append(" ");
            }

            // Convert the ECMAScript value into a string form.
            String s = Context.toString(args[i]);
            sb.append(s);
        }
        PrintStream ps=new PrintStream(System.out,true,"UTF-8");
        ps.println(sb.toString());
    }

    /**
     * To wrap a function in an handler.
     */
    public static class FunctionWrapper implements Runnable {

        /**
         * The current interpreter.
         */
        protected RhinoInterpreter interpreter;

        /**
         * The function wrapper.
         */
        protected Function function;

        /**
         * The arguments.
         */
        protected Object[] arguments;

        /**
         * Creates a function wrapper.
         */
        public FunctionWrapper(RhinoInterpreter ri,
                               Function f,
                               Object[] args) {
            interpreter = ri;
            function = f;
            arguments = args;
        }

        /**
         * Calls the function.
         */
        public void run() {
//            if ("animator".equals(function.get("name",null))) {
//                Date dt=new Date();
//                System.out.println(function.get("name",null)+": "+dt.toString()+" "+String.valueOf(dt.getTime() % 1000));
//            }
            interpreter.callHandler(function, arguments);
        }
    }

    /**
     * To wrap a function passed to getURL().
     */
    protected static class GetURLFunctionWrapper
        implements Window.URLResponseHandler {

        /**
         * The current interpreter.
         */
        protected RhinoInterpreter interpreter;

        /**
         * The function wrapper.
         */
        protected Function function;

        /**
         * The WindowWrapper
         */
        protected WindowWrapper windowWrapper;

        /**
         * Creates a wrapper.
         */
        public GetURLFunctionWrapper(RhinoInterpreter ri, Function fct,
                                     WindowWrapper ww) {
            interpreter = ri;
            function = fct;
            windowWrapper = ww;
        }

        /**
         * Called before 'getURL()' returns.
         * @param success Whether the data was successfully retreived.
         * @param mime The data MIME type.
         * @param content The data.
         */
        public void getURLDone(final boolean success,
                               final String mime,
                               final String content) {
            interpreter.callHandler
                (function,
                 new GetURLDoneArgBuilder(success, mime,
                                          content, windowWrapper));
        }
    }

        /**
     * To wrap an object passed to getURL().
     */
    private static class GetURLObjectWrapper
        implements Window.URLResponseHandler {

        /**
         * The current interpreter.
         */
        private RhinoInterpreter interpreter;

        /**
         * The object wrapper.
         */
        private ScriptableObject object;

        /**
         * The Scope for the callback.
         */
        private WindowWrapper windowWrapper;

        private static final String COMPLETE = "operationComplete";

        /**
         * Creates a wrapper.
         */
        public GetURLObjectWrapper(RhinoInterpreter ri,
                                   ScriptableObject obj,
                                   WindowWrapper ww) {
            interpreter = ri;
            object = obj;
            windowWrapper = ww;
        }

        /**
         * Called before 'getURL()' returns.
         * @param success Whether the data was successfully retreived.
         * @param mime The data MIME type.
         * @param content The data.
         */
        public void getURLDone(final boolean success,
                               final String mime,
                               final String content) {
            interpreter.callMethod
                (object, COMPLETE,
                 new GetURLDoneArgBuilder(success, mime,
                                          content, windowWrapper));
        }
    }

    protected static class PopupMenuFunctionWrapper
        implements Window.PopupMenuHandler {

        /**
         * The current interpreter.
         */
        protected RhinoInterpreter interpreter;

        /**
         * The function wrapper.
         */
        protected Function function;

        /**
         * The WindowWrapper
         */
        protected WindowWrapper windowWrapper;

        /**
         * Creates a wrapper.
         */
        public PopupMenuFunctionWrapper(RhinoInterpreter ri, Function fct,
                                     WindowWrapper ww) {
            interpreter = ri;
            function = fct;
            windowWrapper = ww;
        }

        public void menuSel(final boolean success,
                               final String mime,
                               final String content) {
            interpreter.callHandler
                (function,
                 new GetURLDoneArgBuilder(success, mime,
                                          content, windowWrapper));
        }

        public void menuSelected(String key) {
            interpreter.callHandler
                (function,
                 new PopupMenuArgBuilder(key, windowWrapper));
        }
    }


    private static class PopupMenuObjectWrapper
        implements Window.PopupMenuHandler {

        /**
         * The current interpreter.
         */
        private RhinoInterpreter interpreter;

        /**
         * The object wrapper.
         */
        private ScriptableObject object;

        /**
         * The Scope for the callback.
         */
        private WindowWrapper windowWrapper;

        private static final String COMPLETE = "operationComplete";


        public PopupMenuObjectWrapper(RhinoInterpreter ri,
                                   ScriptableObject obj,
                                   WindowWrapper ww) {
            interpreter = ri;
            object = obj;
            windowWrapper = ww;
        }


        @Override
        public void menuSelected(String key) {
            interpreter.callMethod
                (object, COMPLETE,
                 new PopupMenuArgBuilder(key, windowWrapper));
        }
    }


    static class GetURLDoneArgBuilder
        implements RhinoInterpreter.ArgumentsBuilder {
        boolean success;
        String mime, content;
        WindowWrapper windowWrapper;
        public GetURLDoneArgBuilder(boolean success,
                                    String mime, String content,
                                    WindowWrapper ww) {
            this.success = success;
            this.mime    = mime;
            this.content = content;
            this.windowWrapper = ww;
        }

        public Object[] buildArguments() {
            ScriptableObject so = new NativeObject();
            so.put("success", so,
                   (success) ? Boolean.TRUE : Boolean.FALSE);
            if (mime != null) {
                so.put("contentType", so,
                       Context.toObject(mime, windowWrapper));
            }
            if (content != null) {
                so.put("content", so,
                       Context.toObject(content, windowWrapper));
            }
            return new Object [] { so };
        }
    }

    static class PopupMenuArgBuilder
        implements RhinoInterpreter.ArgumentsBuilder {
        String key;
        WindowWrapper windowWrapper;
        public PopupMenuArgBuilder(String key, WindowWrapper ww) {
            this.key = key;
            this.windowWrapper = ww;
        }

        public Object[] buildArguments() {
            ScriptableObject so = new NativeObject();

            so.put("key", so, Context.toObject(key, windowWrapper));
            return new Object [] { so };
        }
    }

}
