/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.awt.Color;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.apache.batik.util.ParsedURL;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.json.JSONArray;
import org.json.JSONException;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xhtmlrenderer.resource.XMLResource;
import org.xhtmlrenderer.util.GeneralUtil;

/**
 *
 * @author vns
 */
public class XMLConfig {

    private XMLResource xmlResource=null;
    
    public XMLConfig(String source) {
        xmlResource=getXMLResourceFromString(source);
    }
    
    public XMLConfig(JSONArray source) throws JSONException {
        xmlResource=getXMLResourceFromString(jsonArrayToString(source));
    }
    
    public static String jsonArrayToString(JSONArray source) throws JSONException {
        StringBuilder sb=new StringBuilder();
        for (int i=0; i<source.length(); i++) {
            Object element=source.get(i);
            if (element instanceof String) {
                sb.append(element);
            } else if (element instanceof JSONArray) {
                sb.append(jsonArrayToString((JSONArray)element));
            } else if (element instanceof Integer) {
                byte[] b=new byte[1];
                sb.append(new String(b));
            } else {
                sb.append(element.toString());
            }
        }
        return sb.toString();
    }
    
    public Node getRootNode() {
        return xmlResource.getDocument().getDocumentElement();
    }

    public NodeList getNodes(String path,Object element) {
        try {
            XPath xPath = XPathFactory.newInstance().newXPath();
            return (NodeList) xPath.evaluate(path,element,XPathConstants.NODESET);
        } catch (XPathExpressionException ex) {
            return null;
        }
    }

    public NodeList getNodes(String path) {
        return getNodes(path,xmlResource.getDocument().getDocumentElement());
    }

    public Node getNode(String path) {
        try {
            XPath xPath = XPathFactory.newInstance().newXPath();
            return (Node) xPath.evaluate(path,xmlResource.getDocument().getDocumentElement(),XPathConstants.NODE);
        } catch (XPathExpressionException ex) {
            Logger.getLogger(XMLConfig.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }

    public Color getColor(String path,Object element) {
        Number value = getNumber(path,element);
        return new Color(value.intValue());
    }

    public Color getColor(String path) {
        return getColor(path,xmlResource.getDocument().getDocumentElement());
    }

    public Number getNumber(String path,Object element) {
        String value=getString(path,element);
        if (value.length()>=2) {
            String prefix=value.substring(0, 2);
            if ((prefix.equals("0x")) || (prefix.equals("0X"))) {
                return Long.parseLong(value.substring(2), 16);
            }
        }
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return (double)0.0;
        }
    }

    public Number getNumber(String path) {
        return getNumber(path,xmlResource.getDocument().getDocumentElement());
    }


    public String getString(String path,Object element) {
        String value=new String();
        try {
            XPath xPath = XPathFactory.newInstance().newXPath();
            value=(String) xPath.evaluate(path,element, XPathConstants.STRING);
        } catch (XPathExpressionException ex) {
            Logger.getLogger(TrendsFrame.class.getName()).log(Level.SEVERE, null, ex);
        }
        return value;
    }

    public String getString(String path) {
        return getString(path,xmlResource.getDocument().getDocumentElement());
    }

    private XMLResource getXMLResource(String uri) {
        XMLResource xr = null;
        Reader inputStreamReader = null;
        try {
            uri = resolveURI(uri);
            if (uri!=null && uri.startsWith("file:")) {
                inputStreamReader=new InputStreamReader(new ParsedURL(uri).openStreamRaw());
            } else if (uri!=null && uri.startsWith("jar:file:")) {
                inputStreamReader=new InputStreamReader(new ParsedURL(uri).openStreamRaw());
            } else if (uri!=null && uri.startsWith("http:")) {
                DefaultHttpClient httpClient=new DefaultHttpClient();
                HttpParams params=httpClient.getParams();
                HttpConnectionParams.setSoReuseaddr(params, true);
                HttpConnectionParams.setLinger(params, 0);
                HttpConnectionParams.setSoKeepalive(params, true);
                HttpConnectionParams.setTcpNoDelay(params, true);
                httpClient.setParams(params);
                URL url=new URL(uri);
                HttpPost httppost=new HttpPost(url.getProtocol()+"://"+url.getAuthority()+url.getPath());
                httppost.setEntity(new StringEntity(url.getQuery(),"UTF-8"));
                HttpResponse response=httpClient.execute(httppost);
                BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent(),"UTF-8"));
                final StringBuffer sb = new StringBuffer();
                int read;
                char[] buf = new char[4096];
                while ((read = rd.read(buf, 0, buf.length)) != -1) {
                    sb.append(buf, 0, read);
                }
                rd.close();
                inputStreamReader=new StringReader(sb.toString());
            }
            xr = XMLResource.load(inputStreamReader);
        } catch (IOException ex) {
            Logger.getLogger(PanelManager.class.getName()).log(Level.SEVERE, null, ex);
        } finally {
            if (inputStreamReader != null) {
                try {
                    inputStreamReader.close();
                } catch (IOException e) {
                    // swallow
                }
            }
        }
        return xr;
    }
    
    private XMLResource getXMLResourceFromString(String source) {
        XMLResource xr = null;
        Reader inputStreamReader = null;
        try {
            inputStreamReader=new StringReader(source);
            xr = XMLResource.load(inputStreamReader);
        } finally {
            if (inputStreamReader != null) {
                try {
                    inputStreamReader.close();
                } catch (IOException e) {
                    // swallow
                }
            }
        }
        return xr;
    }

   
    private String resolveURI(String uri) {
		URL ref = null;

		if (uri == null) {
            return "";
        }
        if (uri.trim().equals("")) {
            return "";
        }

        try {
            URL base;
            base = new File(".").toURL();
            ref = new URL(base, uri);
        } catch (MalformedURLException e) {
        }

        if (ref == null) {
            return null;
        } else {
            return ref.toExternalForm();
        }
    }

}
