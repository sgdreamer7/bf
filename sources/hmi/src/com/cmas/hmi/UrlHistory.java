/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.util.Stack;

/**
 *
 * @author vns
 */
public class UrlHistory {
    private static Stack<String> urlHistory = new Stack<String>();
    
    public static void push(String url) {
        if (urlHistory.search(url)>0) {
            urlHistory.clear();
        }
        urlHistory.push(url);
    }
    
    public static String pop() {
        return urlHistory.pop();
    }
    
     public static String peek() {
        return urlHistory.peek();
    }
}
