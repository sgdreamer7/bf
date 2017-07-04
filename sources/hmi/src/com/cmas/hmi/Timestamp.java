/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Admin
 */
public class Timestamp extends Object implements Comparable {

    private String varType="timestamp";

    private int year=2000;
    private int month=1;
    private int day=1;
    private int hour=0;
    private int minute=0;
    private int second=0;

    public Timestamp(String datetime) {
        String[] parts=datetime.split(" ");
        String[] dates=parts[0].split("\\x2E");
        String[] times=parts[1].split(":");
        this.year=Integer.valueOf(dates[0]).intValue();
        this.month=Integer.valueOf(dates[1]).intValue();
        this.day=Integer.valueOf(dates[2]).intValue();
        this.hour=Integer.valueOf(times[0]).intValue();
        this.minute=Integer.valueOf(times[1]).intValue();
        this.second=Integer.valueOf(times[2]).intValue();

    }

    public Timestamp(Calendar cal) {
        this.year=cal.get(Calendar.YEAR);
        this.month=cal.get(Calendar.MONTH)+1;
        this.day=cal.get(Calendar.DAY_OF_MONTH);
        this.hour=cal.get(Calendar.HOUR_OF_DAY);
        this.minute=cal.get(Calendar.MINUTE);
        this.second=cal.get(Calendar.SECOND);
    }

    public Timestamp(int year,int month,int day,int hour,int minute,int second) {
        this.year=year;
        this.month=month;
        this.day=day;
        this.hour=hour;
        this.minute=minute;
        this.second=second;
    }

    public Timestamp(long milliseconds) {
        Calendar cal=getCalendar();
        cal.setTimeInMillis(milliseconds);
        cal.set(Calendar.MILLISECOND,0);
        this.year=cal.get(Calendar.YEAR);
        this.month=cal.get(Calendar.MONTH)+1;
        this.day=cal.get(Calendar.DAY_OF_MONTH);
        this.hour=cal.get(Calendar.HOUR_OF_DAY);
        this.minute=cal.get(Calendar.MINUTE);
        this.second=cal.get(Calendar.SECOND);
    }

    public Timestamp() {
        this.year=2000;
        this.month=1;
        this.day=1;
        this.hour=0;
        this.minute=0;
        this.second=0;
    }

    public Timestamp(HashMap res) {
        this.year=((Long)res.get("year")).intValue();
        this.month=((Long)res.get("month")).intValue();
        this.day=((Long)res.get("day")).intValue();
        this.hour=((Long)res.get("hour")).intValue();
        this.minute=((Long)res.get("minute")).intValue();
        this.second=((Long)res.get("second")).intValue();
    }


    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getMinute() {
        return minute;
    }

    public void setMinute(int minute) {
        this.minute = minute;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getSecond() {
        return second;
    }

    public void setSecond(int second) {
        this.second = second;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Calendar getCalendar() {
        Calendar cal = new GregorianCalendar(this.year, this.month-1, this.day,this.hour,this.minute,this.second);
        cal.set(Calendar.MILLISECOND,0);
        return (Calendar) cal.clone();
    }

    public long getSeconds() {
        return (getMilliSeconds()/1000);
    }

    public long getMilliSeconds() {
        Calendar cal = getCalendar();
        return (cal.getTimeInMillis());
    }

    public Date getDate() {
        Calendar cal = getCalendar();
        return cal.getTime();
    }

    public int getDayOfWeek() {
        Calendar cal=getCalendar();
        return cal.get(Calendar.DAY_OF_WEEK);
    }


    public void AddSeconds(long seconds) {
        Timestamp tmp=new Timestamp(getMilliSeconds()+seconds*1000);
        this.setDay(tmp.getDay());
        this.setMonth(tmp.getMonth());
        this.setYear(tmp.getYear());
        this.setHour(tmp.getHour());
        this.setMinute(tmp.getMinute());
        this.setSecond(tmp.getSecond());
    }

    public void AddMinutes(long minutes) {
        Timestamp tmp=new Timestamp(getMilliSeconds()+minutes*60000);
        this.setDay(tmp.getDay());
        this.setMonth(tmp.getMonth());
        this.setYear(tmp.getYear());
        this.setHour(tmp.getHour());
        this.setMinute(tmp.getMinute());
        this.setSecond(tmp.getSecond());
    }


    public void AddMonths(long month) {
        Calendar cal=getCalendar();
        cal.add(Calendar.MONTH, (int)month);
        this.year=cal.get(Calendar.YEAR);
        this.month=cal.get(Calendar.MONTH)+1;
        this.day=cal.get(Calendar.DAY_OF_MONTH);
        this.hour=cal.get(Calendar.HOUR_OF_DAY);
        this.minute=cal.get(Calendar.MINUTE);
        this.second=cal.get(Calendar.SECOND);
    }

    public void SetMonday() {
        Calendar cal = getCalendar();
        switch (cal.get(Calendar.DAY_OF_WEEK)) {
        case Calendar.SUNDAY:
            cal.add(Calendar.DAY_OF_MONTH, -6);
            break;
        case Calendar.MONDAY:
            cal.add(Calendar.DAY_OF_MONTH, 0);
            break;
        case Calendar.TUESDAY:
            cal.add(Calendar.DAY_OF_MONTH, -1);
            break;
        case Calendar.WEDNESDAY:
            cal.add(Calendar.DAY_OF_MONTH, -2);
            break;
        case Calendar.THURSDAY:
            cal.add(Calendar.DAY_OF_MONTH, -3);
            break;
        case Calendar.FRIDAY:
            cal.add(Calendar.DAY_OF_MONTH, -4);
            break;
        case Calendar.SATURDAY:
            cal.add(Calendar.DAY_OF_MONTH, -5);
            break;
        }
        this.year=cal.get(Calendar.YEAR);
        this.month=cal.get(Calendar.MONTH)+1;
        this.day=cal.get(Calendar.DAY_OF_MONTH);
        this.hour=0;
        this.minute=0;
        this.second=0;
    }

    void SetNow() {
        Calendar cal = new GregorianCalendar();
        this.year=cal.get(Calendar.YEAR);
        this.month=cal.get(Calendar.MONTH)+1;
        this.day=cal.get(Calendar.DAY_OF_MONTH);
        this.hour=cal.get(Calendar.HOUR_OF_DAY);
        this.minute=cal.get(Calendar.MINUTE);
        this.second=cal.get(Calendar.SECOND);
    }

    public boolean isDST() {
        return this.getCalendar().getTimeZone().inDaylightTime(this.getDate());
    }

    public static Timestamp getCETCEST() {
        Timestamp ts=new Timestamp();
        ts.SetNow();
        Calendar cal=ts.getCalendar();
        Calendar newcal=new GregorianCalendar(TimeZone.getTimeZone("CET"));
        newcal.setTimeInMillis(cal.getTimeInMillis());
        int year1=newcal.get(Calendar.YEAR);
        int month1=newcal.get(Calendar.MONTH)+1;
        int day1=newcal.get(Calendar.DAY_OF_MONTH);
        int hour1=newcal.get(Calendar.HOUR_OF_DAY);
        int minute1=newcal.get(Calendar.MINUTE);
        int second1=newcal.get(Calendar.SECOND);
        return new Timestamp(year1,month1,day1,hour1,minute1,second1);
    }

    @Override
    public Timestamp clone() {
        Timestamp tmp=new Timestamp(this.year,this.month,this.day,this.hour,this.minute,this.second);
        return tmp;
    }

    @Override
    public String toString() {
        DateFormat df = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
        return new String(df.format(getDate()));
    }

    public String toStringLeadingYear() {
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return new String(df.format(getDate()));
    }

    public int compareTo(Object o) {
        if (o instanceof Timestamp) {
            long tmp=((Timestamp)o).getMilliSeconds();
            long tmp2=this.getMilliSeconds();
            if (tmp==tmp2) {
                return 0;
            } else if (tmp>tmp2) {
                return -1;
            } else {
                return 1;
            }
        } else {
            throw new UnsupportedOperationException("Not supported yet.");
        }
    }

    public JSONObject toJSON() {
        try {
            JSONObject ts = new JSONObject();
            ts.put("year", year);
            ts.put("month", month);
            ts.put("day", day);
            ts.put("hour", hour);
            ts.put("minute", minute);
            ts.put("second", second);
            return ts;
        } catch (JSONException ex) {
            Logger.getLogger(Timestamp.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }

    public static Timestamp decode(String s) {
        if (s.length()==19) {

            try {
                Timestamp ts=new Timestamp(
                        Long.valueOf(s.substring(0, 4),10).intValue(),
                        Long.valueOf(s.substring(5, 7),10).intValue(),
                        Long.valueOf(s.substring(8, 10),10).intValue(),
                        Long.valueOf(s.substring(11, 13),10).intValue(),
                        Long.valueOf(s.substring(14, 16),10).intValue(),
                        Long.valueOf(s.substring(17, 19),10).intValue()
                );
                return ts;
            } catch (Exception e) {
                return new Timestamp();
            }
        } else {
            return new Timestamp();
        }
    }

    public long difSeconds(Timestamp by) {
        return by.getSeconds()-getSeconds();
    }

    public boolean isMidnight() {
        return ((this.second==0) && (this.minute==0) && (this.hour==0));
    }
}

