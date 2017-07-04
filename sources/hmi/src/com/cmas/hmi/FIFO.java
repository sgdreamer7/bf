/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

/**
 *
 * @author vns
 */
import java.util.LinkedList;

public class FIFO {

  private int sz;
  
  private LinkedList<Double> list = new LinkedList<Double>();

  public FIFO(int sz) {
      this.sz=sz;
  }
  
  /**
   * Puts object in queue.
   */
  public void put(Double o) {
      if (size()>=sz) {
          get();
      }
      list.addLast(o);
  }

  /**
   * Returns an element (object) from queue.
   *
   * @return element from queue or <code>null</code> if queue is empty
   */
  public Double get() {
    if (list.isEmpty()) {
      return null;
    }
    return list.removeFirst();
  }

  /**
   * Returns all elements from the queue and clears it.
   */
  public Double[] getAll() {
    Double[] res = new Double[list.size()];
    for (int i = 0; i < res.length; i++) {
      res[i] = list.get(i);
    }
    return res;
  }


  /**
   * Peeks an element in the queue. Returned elements is not removed from the queue.
   */
  public Double peek() {
    return list.getFirst();
  }

  /**
   * Returns <code>true</code> if queue is empty, otherwise <code>false</code>
   */
  public boolean isEmpty() {
    return list.isEmpty();
  }

  /**
   * Returns queue size.
   */
  public int size() {
    return list.size();
  }
  
  public Double avg() {
      Double[] all=getAll();
      double sum=0.0;
      for (int i=0; i<all.length; i++) {
          sum=(sum*i+all[i].doubleValue())/(i+1);
      }
      return new Double(sum);
  }
}