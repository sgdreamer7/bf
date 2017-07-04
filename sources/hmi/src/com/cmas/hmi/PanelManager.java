/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.awt.Image;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.batik.util.ParsedURL;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.xhtmlrenderer.resource.ImageResource;
import org.xhtmlrenderer.resource.XMLResource;
import org.xhtmlrenderer.swing.NaiveUserAgent;
import org.xhtmlrenderer.util.GeneralUtil;
import org.xhtmlrenderer.util.Uu;


/**
 * PanelManager is a UserAgentCallback responsible for the Browser's resource (XML, image, CSS) lookup. Most of the
 * power is in the NaiveUserAgent; the PanelManager adds support for the demo:, file: and demoNav: protocols,
 * and keeps track of the history of visited links. There is always a "current" link, and one can use the
 * {@link #getBack()}, {@link #getForward()} and {@link #hasForward()} methods to navigate within the history.
 * As a NaiveUserAgent, the PanelManager is also a DocumentListener, but must be added to the source of document
 * events (like a RootPanel subclass).
 *
 */
public class PanelManager extends NaiveUserAgent {
    private int index = -1;
    private ArrayList history = new ArrayList();


	/**
	 * {@inheritDoc}
	 */
	protected ImageResource createImageResource(String uri, Image img) {
		if (img == null) {
			return new DummyImageResource(uri);
		} else {
			return super.createImageResource(uri, img);
		}

	}

	/**
	 * {@inheritDoc}
	 */
    @Override
	public XMLResource getXMLResource(String uri) {
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
                HttpResponse response;
                URL url=new URL(uri);
                if (url.getQuery()==null) {
                    HttpGet httpget=new HttpGet(url.getProtocol()+"://"+url.getAuthority()+url.getPath());
                    response=httpClient.execute(httpget);
                } else {
                    HttpPost httppost=new HttpPost(url.getProtocol()+"://"+url.getAuthority()+url.getPath());
                    httppost.setEntity(new StringEntity(url.getQuery(),"UTF-8"));
                    response=httpClient.execute(httppost);
                }
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

        if (xr == null) {
            xr = getNotFoundDocument(uri);
        }
        return xr;
    }

	/**
	 * Used internally when a document can't be loaded--returns XHTML as an XMLResource indicating that fact.
	 *
	 * @param uri The URI which could not be loaded.
	 *
	 * @return An XMLResource containing XML which about the failure.
	 */
	private XMLResource getNotFoundDocument(String uri) {
        XMLResource xr;

        // URI may contain & symbols which can "break" the XHTML we're creating
        String cleanUri = GeneralUtil.escapeHTML(uri);
        String notFound = "<html><h1>Документ не найден</h1><p>Нет доступен адрес <pre>" + cleanUri + "</pre></p></html>";

        xr = XMLResource.load(new StringReader(notFound));
        return xr;
    }

	/**
	 * Returns true if the link has been visited by the user in this session. Visit tracking is not persisted.
	 */
	public boolean isVisited(String uri) {
        if (uri == null) {
            return false;
        }
        uri = resolveURI(uri);
        return history.contains(uri);
    }

	/**
	 * {@inheritDoc}
	 */
    @SuppressWarnings("empty-statement")
	public void setBaseURL (String url) {
		String burl = super.getBaseURL();
		if(burl !=null &&  burl.startsWith("error:")) {
            burl = null;
        }

        burl = resolveURI(url);
        if (burl == null) {
            burl = "error:FileNotFound";
        }

		super.setBaseURL(burl);

		// setBaseURL is called by view when document is loaded
        if (index >= 0) {
            String historic = (String) history.get(index);
            if (historic.equals(burl)) {
                return; //moved in history
            } //moved in history
        }
        index++;
        for (int i = index; i < history.size(); history.remove(i)) ;
        history.add(index, burl);
    }

	/**
	 * {@inheritdoc}.
	 */
	public String resolveURI(String uri) {
		final String burl = getBaseURL();

		URL ref = null;

		if (uri == null) {
            return burl;
        }
        if (uri.trim().equals("")) {
            return burl; //jar URLs don't resolve this right
        } //jar URLs don't resolve this right

		if (uri.startsWith("javascript")) {
            Uu.p("Javascript URI, ignoring: " + uri);
        } else if (uri.startsWith("news")) {
            Uu.p("News URI, ignoring: " + uri);
        } else {
            try {
                URL base;
                if (burl == null || burl.length() == 0) {
                    base = new File(".").toURL();
                } else {
                    base = new URL(burl);
                }
                ref = new URL(base, uri);
            } catch (MalformedURLException e) {
                Uu.p("URI/URL is malformed: " + burl + " or " + uri);
            }
        }

        if (ref == null) {
            return null;
        }
        else {
            return ref.toExternalForm();
        }
    }

	/**
	 * Returns the "next" URI in the history of visiting URIs. Advances the URI tracking (as if browser "forward" was
	 * used).
	 */
	public String getForward() {
        index++;
        return (String) history.get(index);
    }

	/**
	 * Returns the "previous" URI in the history of visiting URIs. Moves the URI tracking back (as if browser "back" was
	 * used).
	 */
	public String getBack() {
        index--;
        return (String) history.get(index);
    }

	/**
	 * Returns true if there are visited URIs in history "after" the pointer the the current URI. This would be the case
	 * if multiple URIs were visited and the getBack() had been called at least once.
	 */
	public boolean hasForward() {
        if (index + 1 < history.size() && index >= 0) {
            return true;
        } else {
            return false;
        }
    }

	/**
	 * Returns true if there are visited URIs in history "before" the pointer the the current URI. This would be the case
	 * if multiple URIs were visited and the current URI pointer was not at the begininnig of the visited URI list.
	 */
    public boolean hasBack() {
        if (index > 0) {
            return true;
        } else {
            return false;
        }
    }

	/**
	 * Simple wrapper class for image URIs that can't be loaded.
	 */
	private class DummyImageResource extends ImageResource {
        private final String uri;

        public DummyImageResource(String uri) {
            super(null);
            this.uri = uri;
        }
    }
        
    private String escape(String string) {
        char         c;
        String       s = string.trim();
        StringBuffer sb = new StringBuffer();
        int          length = s.length();
        for (int i = 0; i < length; i += 1) {
            c = s.charAt(i);
            if (c < ' ' || c == '+' || c == '%' || c == '=' || c == ';') {
                sb.append('%');
                sb.append(Character.forDigit((char)((c >>> 4) & 0x0f), 16));
                sb.append(Character.forDigit((char)(c & 0x0f), 16));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

}
