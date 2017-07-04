/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.net.URI;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.SwingUtilities;
import org.java_websocket.WebSocket.READYSTATE;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.*;
/**
 *
 * @author vns
 */
public class CommClient {
    public static boolean isCommClientDebugging=false;
    
    private HashMap<String,Callback> callbacks;
    private WebSocketClient ws;
    private URI wsUrl;
    protected long msgId=0;
    protected Timer timer = new Timer(true);
    private TimerTask tt;
    private TimerTask ttComm;
    private TimerTask ttAlarm;
    private TimerTask ttTagsList;
    
    protected HashMap<String,Object> tags=new HashMap<String,Object>();
    protected HashMap<String,Date> tagsUsage=new HashMap<String,Date>();
    protected HashMap<String,Object> commIDs=new HashMap<String,Object>();
    protected String activeCommID="";
    protected long sendCount=0;
    protected long receiveCount=0;
    protected Date lastSendTS=null;
    protected long sendCount2=0;
    protected long receiveCount2=0;
    protected Date lastSendTS2=null;
    protected long sendCount3=0;
    protected long receiveCount3=0;
    protected Date lastSendTS3=null;
    protected FIFO avgFifo=new FIFO(100);
    protected String alarmMessages="";
    protected String tagsList="";
    protected boolean updateAlarms=false;
    protected boolean updateTagsList=false;
    protected String clientID="";
    
    public CommClient() {
        this.wsUrl=null;
        this.callbacks=new HashMap<String,Callback>();
        this.ws=null;
        
    }

    public CommClient(String backend,String clientID) {
        this.clientID=clientID;
        this.wsUrl=URI.create("ws://"+backend+"/ws_endpoint");
        this.callbacks=new HashMap<String,Callback>();
        this.ws=null;
        if (this.tt==null) {
            this.tt = setInterval(
                new Runnable() {
                    public void run() {
                        try {
                            checkConnection();
                        } catch (Exception e) {
                            if (CommClient.isCommClientDebugging) e.printStackTrace();
                        }
                    }
                },
                5000
            );
        }
        if (this.ttComm==null) {
            this.ttComm = setInterval(
                new Runnable() {
                    public void run() {
                        try {
                            updateComm();
                        } catch (Exception e) {

                        }
                    }
                },
                100
            );
        }
        if (this.ttAlarm==null) {
            this.ttAlarm = setInterval(
                new Runnable() {
                    public void run() {
                        try {
                            updateAlarm();
                        } catch (Exception e) {

                        }
                    }
                },
                100
            );
        }
        if (this.ttTagsList==null) {
            this.ttTagsList = setInterval(
                new Runnable() {
                    public void run() {
                        try {
                            updateTagList();
                        } catch (Exception e) {

                        }
                    }
                },
                120000
            );
        }
    }
    
    private synchronized long getMsgId() {
        if (msgId<0xfffffff) {
            msgId++;
        } else {
            msgId=0;
        }
        return msgId;
    }
    
    public void connect()  {
        ws=null;
        Date ts=new Date();
        if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": Trying connect to "+wsUrl.toString()+".");
        this.ws=new WebSocketClient(this.wsUrl,new Draft_17(),null,5000) {

            @Override
            public void onOpen(ServerHandshake handshakedata) {
                Date ts=new Date();
                if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": Connected to "+wsUrl.toString()+".");
            }

            @Override
            public void onMessage(String message) {
                try {
                    JSONObject result=new JSONObject(message);
                    String commandName=result.optString("command");
                    Object commandResult=result.get("result");
                    String msgIdStr=result.optString("msgid");
                    Callback callback=callbacks.get(msgIdStr);
                    Object[] res=new Object[2];
                    res[0]=commandResult.toString();
                    res[1]=commandResult;
                    if (callback!=null) {
                        callback.call(res);
                        callbacks.remove(msgIdStr);
                    } else {
                        if ("updated_tag".equals(commandName)) {
                            JSONObject obj=(JSONObject)commandResult;
                            String tagName=obj.getString("name");
                            JSONObject tagFields=obj.getJSONObject("fields");
                            Iterator keys=tagFields.keys();
                            while  (keys.hasNext()==true) {
                                String key=(String)keys.next();
                                Object value=tagFields.get(key);
                                tags.put(tagName+"."+key, value);
                            }
                        } 
                    }
                } catch (JSONException ex) {
                }
            }

            @Override
            public void onMessage(ByteBuffer message) {
                String commandName="get_trends_data";
                Callback callback=callbacks.get(commandName);
                if (callback!=null) {
                    callback.call(message);
                    callbacks.remove(commandName);
                }
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                Date ts=new Date();
                if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": Connection to "+wsUrl.toString()+" close.");
                if (CommClient.isCommClientDebugging) System.out.println("Code: "+String.valueOf(code)+", Reason: "+reason+", Remote: "+String.valueOf(remote));
            }

            @Override
            public void onError(Exception ex) {
                Date ts=new Date();
                if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": Connection to "+wsUrl.toString()+" error.");
                if (CommClient.isCommClientDebugging) ex.printStackTrace();
            }

        };
        ws.connect();
    }

    public void setUpdateAlarms(boolean updateAlarms) {
        this.updateAlarms=updateAlarms;
    }

    public void setUpdateTagsList(boolean updateTagsList) {
        this.updateTagsList=updateTagsList;
    }

    public void execute_async(final String commandName,JSONObject commandArgs,final Callback callback) throws JSONException {
        try {
            if (ws!=null) {
                JSONObject message=new JSONObject();
                message.put("command", commandName);
                message.put("args",commandArgs);
                String id=String.valueOf(getMsgId());
                message.put("msgid",id);
                callbacks.put(id,callback);
                String messageStr=message.toString();
                ws.send(messageStr);
            }
        } catch (Exception e) {
//            e.printStackTrace();
        }

    }
    
    public void execute_async_js(final String commandName,NativeObject commandArgs,final Function callback) throws JSONException {
        try {
            if (ws!=null) {
                JSONObject message=new JSONObject();
                message.put("command", commandName);
                message.put("args",commandArgs);
                Callback javaCallback=new Callback() {
                    public void call(Object params) {
                            Context context = Context.enter();
                            ScriptableObject scope = context.initStandardObjects();
                            Scriptable that = context.newObject(scope);
                            Object[] args=new Object[1];
                            Object[] res=new Object[2];
                            res[0]=((Object[])params)[0];
                            res[1]=((Object[])params)[1];
                            args[0]=Context.javaToJS(res,scope);
                            if (callback!=null) {
                                callback.call(context,scope, that, args);
                            }
                    }
                };
                String id=String.valueOf(getMsgId());
                message.put("msgid",id);
                callbacks.put(id,javaCallback);
                String messageStr=message.toString();
                ws.send(messageStr);
            }
        } catch (Exception e) {
            if (CommClient.isCommClientDebugging) e.printStackTrace();
        }
    }
    
    public boolean isConnected() {
        if (ws!=null) {
            if (ws.getReadyState()==READYSTATE.OPEN) {
                return true;
            }
        }
        return false;
    }
    
    private void checkConnection() {
        if (ws!=null) {
            if (!((ws.getReadyState()==READYSTATE.OPEN) || (ws.getReadyState()==READYSTATE.CONNECTING))) {
                Date ts=new Date();
                if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": No connection. Reconnecting... "+wsUrl.toString());
                if (ws!=null) {
                    if (CommClient.isCommClientDebugging) System.out.println(ts.toString()+": "+clientID+": ready state: "+String.valueOf(ws.getReadyState())+" "+wsUrl.toString());
                    ws.close();
                    ws=null;
                }
                connect();
            }
        }
    }

    public Object getTagField(String tagName, String fieldName,String commID) {
        String fullTagName=tagName+"."+fieldName;
//        System.out.println("calling checkTagForCommID: "+fullTagName+", "+commID);
        checkTagForCommID(fullTagName,commID);
//        System.out.println("checking fullTagName: "+fullTagName+", "+commID);
        if (tags.containsKey(fullTagName)) {
//            System.out.println("returning data: "+fullTagName+", "+commID);
            return tags.get(fullTagName);
        }
//        System.out.println("returning null data: "+fullTagName+", "+commID);
        return null;
    }
    
    public String getAlarmMessages() {
        return alarmMessages;
    }

    public String getTagsList() {
        return tagsList;
    }

    private void  checkTagForCommID(String fullTagName,String commID) {
        ArrayList<String> tagsNames=(ArrayList<String>) commIDs.get(commID);
        if (tagsNames==null) {
            tagsNames=new ArrayList<String>();
            tagsNames.add(fullTagName);
            commIDs.put(commID, tagsNames);
        } else {
            if (tagsNames.contains(fullTagName)==false) {
                tagsNames.add(fullTagName);
                commIDs.put(commID, tagsNames);
            }
        }
        tagsUsage.put(fullTagName, new Date());
        activeCommID=commID;
    }
    
    private synchronized void updateComm() {
        try {
            if (!"".equals(activeCommID)) {
                boolean okToSendRequest=false;
                if (lastSendTS==null) {
                    lastSendTS=new Date();
                }
                Date currentSendTS=new Date();
                long dif=Math.abs(currentSendTS.getTime()-lastSendTS.getTime());
                if (sendCount==receiveCount) {
                    avgFifo.put(new Double(dif));
                    okToSendRequest=true;
                } else {
                    if (dif>1000) {
                        receiveCount=sendCount;
                        okToSendRequest=true;
                    }
                }
                if (okToSendRequest==true) {
                    lastSendTS=currentSendTS;
                    if (sendCount<100){
                        sendCount++;
                    } else {
                        sendCount=0;
                    }
//                    System.out.println("activeCommID="+activeCommID);
                    ArrayList<String> tagsNames=(ArrayList<String>) commIDs.get(activeCommID);
                    if (tagsNames!=null) {
                        JSONObject args=new JSONObject();
                        JSONObject tagsArgs=new JSONObject();
                        ListIterator<String> iterator=tagsNames.listIterator();
                        Date ts=new Date();
                        while (iterator.hasNext()) {
                            String tagName=iterator.next();
                            try {
                                Date tagUsage=tagsUsage.get(tagName);
                                if (tagUsage!=null) {
                                    if (Math.abs(tagUsage.getTime()-ts.getTime())<5000) {
                                        tagsArgs.put(tagName, "");
                                    }
                                }
                            } catch (JSONException ex) {
                                Logger.getLogger(CommClient.class.getName()).log(Level.SEVERE, null, ex);
                            }
                        }
                        try {
                            args.put("data", tagsArgs);
                        } catch (JSONException ex) {
                            Logger.getLogger(CommClient.class.getName()).log(Level.SEVERE, null, ex);
                        }
                        try {
//                            Date ts=new Date();
//                            System.out.println("Sending \'get_all_tags_untyped\' request: "+ts.toString()+", "+String.valueOf(ts.getTime() % 1000));
                            execute_async(
                                    "get_all_tags_untyped", 
                                    args, 
                                    new Callback() {
                                        public void call(Object param) {
                                            if (receiveCount<100){
                                                receiveCount++;
                                            } else {
                                                receiveCount=0;
                                            }
                                            JSONObject result=(JSONObject)((Object[])param)[1];
                                            JSONObject dataJSON = null;
                                            try {
                                                dataJSON = result.getJSONObject("data");
                                                Iterator keys=dataJSON.keys();
                                                while (keys.hasNext()) {
                                                    String key=(String) keys.next();
                                                    if (key.indexOf("PSG")>=0) {
                                                        if (CommClient.isCommClientDebugging) System.out.println("key="+key+", dataJSON.get(key)="+dataJSON.get(key));
                                                    }
                                                    tags.put(key, dataJSON.get(key));
                                                }
                                            } catch (JSONException ex) {
                                                Logger.getLogger(CommClient.class.getName()).log(Level.SEVERE, null, ex);
                                            }
                                        }
                                    }
                            );
                        } catch (JSONException ex) {
                            Logger.getLogger(CommClient.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                }
            }
        } catch (Exception e) {
            if (CommClient.isCommClientDebugging) e.printStackTrace();
        }
    }

    private synchronized void updateAlarm() {
        try {
            if (updateAlarms==true) {
                boolean okToSendRequest2=false;
                if (lastSendTS2==null) {
                    lastSendTS2=new Date();
                }
                Date currentSendTS2=new Date();
                long dif2=Math.abs(currentSendTS2.getTime()-lastSendTS2.getTime());
                if (sendCount2==receiveCount2) {
                    okToSendRequest2=true;
                } else {
                    if (dif2>5000) {
                        receiveCount2=sendCount2;
                        okToSendRequest2=true;
                    }
                }
                if (okToSendRequest2==true) {
                    lastSendTS2=currentSendTS2;
                    if (sendCount2<100){
                        sendCount2++;
                    } else {
                        sendCount2=0;
                    }
                    JSONObject args=new JSONObject();
                    execute_async(
                            "get_all_messages", 
                            args,
                            new Callback() {
                                public void call(Object param) {
                                    if (receiveCount2<100){
                                        receiveCount2++;
                                    } else {
                                        receiveCount2=0;
                                    }
                                    alarmMessages=(String)((Object[])param)[0];
                                }
                            }
                    );
                }
            }
        } catch (Exception e) {
            if (CommClient.isCommClientDebugging) e.printStackTrace();
        }
    }

    private synchronized void updateTagList() {
        try {
            if (updateTagsList==true) {
                boolean okToSendRequest3=false;
                if (lastSendTS3==null) {
                    lastSendTS3=new Date();
                }
                Date currentSendTS3=new Date();
                long dif3=Math.abs(currentSendTS3.getTime()-lastSendTS3.getTime());
                if (sendCount3==receiveCount3) {
                    okToSendRequest3=true;
                } else {
                    if (dif3>120000) {
                        receiveCount3=sendCount3;
                        okToSendRequest3=true;
                    }
                }
                if (okToSendRequest3==true) {
                    lastSendTS3=currentSendTS3;
                    if (sendCount3<100){
                        sendCount3++;
                    } else {
                        sendCount3=0;
                    }
                    JSONObject args=new JSONObject();
                    execute_async(
                            "get_tags_list", 
                            args,
                            new Callback() {
                                public void call(Object param) {
                                    if (receiveCount3<100){
                                        receiveCount3++;
                                    } else {
                                        receiveCount3=0;
                                    }
                                    tagsList=(String)((Object[])param)[0];
                                }
                            }
                    );
                }
            }
        } catch (Exception e) {
            if (CommClient.isCommClientDebugging) e.printStackTrace();
        }
    }

    protected class IntervalRunnable implements Runnable {
        public int count;
        public boolean error;

        protected Runnable runnable;

        public IntervalRunnable(Runnable r) {
            runnable = r;
        }
        public void run() {
            synchronized (this) {
                if (error)
                    return;
                count--;
            }
            try {
                runnable.run();
            } catch (Exception e) {
                if (CommClient.isCommClientDebugging) e.printStackTrace(); 
                synchronized (this) {
                    error = true;
                }
            }
        }
    }
    
    public TimerTask setInterval(final Runnable r, long interval) {
        TimerTask tt = new TimerTask() {
                IntervalRunnable ir =new IntervalRunnable(r);
                public void run() {
                    synchronized (ir) {
                        if (ir.count > 1)
                            return;
                        ir.count++;
                    }
                    SwingUtilities.invokeLater(ir);
                    synchronized (ir) {
                        if (ir.error)
                            cancel();
                    }
                }
            };

        timer.schedule(tt, interval, interval);
        return tt;
    }
}
