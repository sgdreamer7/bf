/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.text.DateFormat;
import java.text.FieldPosition;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 *
 * @author Admin
 */
public class MyDateFormat extends DateFormat {

    private int shift=0;
    private String fmt;
    private String fmtMidnight;


    public MyDateFormat(int shift,String fmt,String fmtMidnight) {
        this.shift = shift;
        this.fmt=fmt;
        this.fmtMidnight=fmtMidnight;
    }

    public MyDateFormat(int shift,String fmt) {
        this.shift = shift;
        this.fmt=fmt;
        this.fmtMidnight=fmt;
    }

    public MyDateFormat(int shift) {
        this(shift,"HH:mm","HH:mm");
    }

    public MyDateFormat() {
        this(0,"HH:mm","HH:mm");
    }

    @Override
    public StringBuffer format(Date date, StringBuffer toAppendTo, FieldPosition fieldPosition) {
        String tmp;

        Timestamp ts=new Timestamp(date.getTime());
        ts.AddMinutes(this.shift);
        DateFormat df = new SimpleDateFormat(this.fmtMidnight);
        DateFormat df2 = new SimpleDateFormat(this.fmt);
        if (ts.isMidnight()) {
            tmp=new String(df.format(ts.getDate()));
        } else {
            tmp=new String(df2.format(ts.getDate()));
        }
        return new StringBuffer(tmp);
    }

    @Override
    public Date parse(String source, ParsePosition pos) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

}
