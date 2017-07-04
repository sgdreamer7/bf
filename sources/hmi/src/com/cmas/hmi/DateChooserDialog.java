package com.cmas.hmi;

import java.awt.Color;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.util.Calendar;
import java.util.Date;
import javax.swing.JComponent;
import javax.swing.KeyStroke;
import org.jfree.ui.DateChooserPanel;

public class DateChooserDialog extends javax.swing.JDialog {

    private CustomDateChooserPanel panel;
    private Date result;

    public DateChooserDialog(java.awt.Frame parent, boolean modal,String title) {
        super(parent, title, modal);
        initComponents();
        Timestamp tmp=new Timestamp();
        Calendar cal=tmp.getCalendar();
        cal.setFirstDayOfWeek(Calendar.MONDAY);
        this.panel=new CustomDateChooserPanel(cal,true);
        this.panel.setChosenDateButtonColor(Color.green);
        this.panel.setBackground(Color.white);
        this.panel.setChosenMonthButtonColor(Color.yellow);
        this.panel.setChosenOtherButtonColor(Color.gray);
        this.panel.setYearSelectionRange(100);
        jPanel1.add(panel);
        pack();

    }

    @SuppressWarnings("unchecked")
    private void initComponents() {

        jPanel1 = new javax.swing.JPanel();
        jCancelButton = new javax.swing.JButton();
        jOKButton = new javax.swing.JButton();

        setName("Form");

        jPanel1.setName("jPanel1");
        jPanel1.setLayout(new javax.swing.BoxLayout(jPanel1, javax.swing.BoxLayout.LINE_AXIS));

        jCancelButton.setText("Отмена");
        jCancelButton.setName("jCancelButton");
        jCancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jCancelButtonActionPerformed(evt);
            }
        });

        jOKButton.setText("Выбор");
        jOKButton.setName("jOKButton");
        jOKButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jOKButtonActionPerformed(evt);
            }
        });
        this.getRootPane().setDefaultButton(jOKButton);
        this.getRootPane().registerKeyboardAction(
                new ActionListener() {

                    @Override
                    public void actionPerformed(ActionEvent e) {
                        jCancelButtonActionPerformed(e);
                    }
                },
                KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0),
                JComponent.WHEN_IN_FOCUSED_WINDOW);
        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, 253, Short.MAX_VALUE)
            .addGroup(layout.createSequentialGroup()
                .addComponent(jOKButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jCancelButton)
                .addGap(96, 96, 96))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                .addComponent(jPanel1, javax.swing.GroupLayout.DEFAULT_SIZE, 190, Short.MAX_VALUE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jOKButton)
                    .addComponent(jCancelButton)))
        );

        pack();
    }

private void jOKButtonActionPerformed(java.awt.event.ActionEvent evt) {
    result=(Date) this.panel.getDate().clone();
    setVisible(false);
}

private void jCancelButtonActionPerformed(java.awt.event.ActionEvent evt) {
    result=null;
    setVisible(false);
}


    public Calendar getResult(Calendar initValue) {
        this.panel.setDate(initValue.getTime());
        result=null;
        setVisible(true);
        if (!(result==null)) {
            Timestamp ts=new Timestamp(result.getTime());
            return ts.getCalendar();
        } else {
            return null;
        }
    }

    private javax.swing.JButton jCancelButton;
    private javax.swing.JButton jOKButton;
    private javax.swing.JPanel jPanel1;

}
