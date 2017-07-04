/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.cmas.hmi;

import java.util.Arrays;
import org.jfree.data.time.RegularTimePeriod;
import org.jfree.data.xy.DefaultOHLCDataset;
import org.jfree.data.xy.OHLCDataItem;

/**
 *
 * @author vns
 */
public class MyDefaultOHLCDataset extends DefaultOHLCDataset {

    /** The series key. */
    private Comparable key;

    /** Storage for the data items. */
    private OHLCDataItem[] data;

    public MyDefaultOHLCDataset(Comparable key, OHLCDataItem[] data) {
        super(key, data);
        this.key = key;
        this.data = data;
    }

    public int getIndex(RegularTimePeriod period) {
        if (period == null) {
            throw new IllegalArgumentException("Null 'period' argument.");
        }
        int res=Arrays.binarySearch(this.data, new OHLCDataItem(period.getStart(),Double.MIN_VALUE,Double.MIN_VALUE,Double.MIN_VALUE,Double.MIN_VALUE,Double.MIN_VALUE));
        return res;
    }
}
