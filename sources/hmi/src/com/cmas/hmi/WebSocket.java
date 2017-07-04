/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import org.java_websocket.WebSocket.READYSTATE;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
/**
 *
 * @author vns
 */
public class WebSocket {

    public static final int CONNECTING = 0;
    public static final int OPEN = 1;
    public static final int CLOSING = 2;
    public static final int CLOSED = 3;
    protected int readyState;
    protected long bufferedAmount;

    protected Function onopen;
    protected Function onerror;
    protected Function onclose;
    protected Function onmessage;

    protected String extensions;
    protected String protocol;


    protected WebSocketClient ws;
    public WebSocket(final String url) throws MalformedURLException, URISyntaxException {
        this.extensions="";
        this.protocol="";
        this.onclose=null;
        this.onerror=null;
        this.onmessage=null;
        this.onopen=null;
        
        URI uri=URI.create(url);
        this.ws=new WebSocketClient(uri,new Draft_17(),null,1000) {

            @Override
            public void onOpen(ServerHandshake handshakedata) {
                if (WebSocket.this.onopen!=null) {
                    Context context = Context.enter();
                    ScriptableObject scope = context.initStandardObjects();
                    Scriptable that = context.newObject(scope);
                    Object[] args=new Object[1];
                    args[0]=url;
                    WebSocket.this.onopen.call(context,scope, that, args);
                }
            }

            @Override
            public void onMessage(String message) {
                if (WebSocket.this.onmessage!=null) {
                    Context context = Context.enter();
                    ScriptableObject scope = context.initStandardObjects();
                    Scriptable that = context.newObject(scope);
                    Object[] args=new Object[1];
                    args[0]=message;
                    WebSocket.this.onmessage.call(context,scope, that, args);
                }
            }
            
            @Override
            public void onMessage( ByteBuffer bytes ) {
                if (WebSocket.this.onmessage!=null) {
                    Context context = Context.enter();
                    ScriptableObject scope = context.initStandardObjects();
                    Scriptable that = context.newObject(scope);
                    Object[] args=new Object[1];
                    args[0]=bytes;
                    WebSocket.this.onmessage.call(context,scope, that, args);
                }
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                if (WebSocket.this.onclose!=null) {
                    Context context = Context.enter();
                    ScriptableObject scope = context.initStandardObjects();
                    Scriptable that = context.newObject(scope);
                    Object[] args=new Object[3];
                    args[0]=code;
                    args[1]=reason;
                    args[2]=remote;
                    WebSocket.this.onclose.call(context,scope, that, args);
                }
            }

            @Override
            public void onError(Exception ex) {
                if (WebSocket.this.onerror!=null) {
                    Context context = Context.enter();
                    ScriptableObject scope = context.initStandardObjects();
                    Scriptable that = context.newObject(scope);
                    Object[] args=new Object[1];
                    args[0]=ex;
                    WebSocket.this.onerror.call(context,scope, that,  args);
                }
            }
        };
    }

    public String getUrl() throws MalformedURLException {
        return ws.getURI().toString();
    }

    public long getBufferedAmount() {
        return 0;
    }

    public String getExtensions() {
        return extensions;
    }

    public String getProtocol() {
        return protocol;
    }

    public int getReadyState() {
        READYSTATE state=ws.getReadyState();
        if ((state==READYSTATE.NOT_YET_CONNECTED) || (state==READYSTATE.CLOSED)) {
            return CLOSED;
        } else if (state==READYSTATE.CONNECTING) {
            return CONNECTING;
        } else if (state==READYSTATE.OPEN) {
            return OPEN;
        } else if (state==READYSTATE.CLOSING) {
            return CLOSING;
        }
        return CLOSED;
    }

    public void setOnclose(Function onclose) {
        this.onclose = onclose;
    }

    public void setOnerror(Function onerror) {
        this.onerror = onerror;
    }

    public void setOnmessage(Function onmessage) {
        this.onmessage = onmessage;
    }

    public void setOnopen(Function onopen) {
        this.onopen = onopen;
    }

    public void connect() {
        try {
            ws.connect();
        } catch (Exception e) {
            //do nothing
        }
    }
    
    public void close() {
        ws.close();
    }

    public void send(String message) {
        ws.send(message);
    }
    
    public void sendBinary(String message) {
        ws.send(message.getBytes());
    }
    
}
