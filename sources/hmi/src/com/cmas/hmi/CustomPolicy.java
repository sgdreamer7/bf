/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cmas.hmi;

import java.security.*;

/**
 *
 * @author vns
 */
public class CustomPolicy extends Policy {
    
    @Override
    public PermissionCollection getPermissions(CodeSource codesource) {
        return (new AllPermission()).newPermissionCollection();
    }
    
    @Override
    public PermissionCollection getPermissions(ProtectionDomain domain) {
        return (new AllPermission()).newPermissionCollection();
    }
}
