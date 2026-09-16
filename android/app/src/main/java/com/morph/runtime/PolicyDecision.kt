package com.morph.runtime

/**
 * Centralizes the runtime decision: only Morph, Android essentials and the
 * packages explicitly authorised by the active phase are allowed.
 * Everything else, including games unknown to the catalogue, is denied.
 */
object PolicyDecision {
    fun isAllowed(
        packageName: String,
        ownPackage: String,
        allowedPackages: Set<String>,
        systemPackages: Set<String>
    ): Boolean = packageName == ownPackage || packageName in allowedPackages || packageName in systemPackages
}
