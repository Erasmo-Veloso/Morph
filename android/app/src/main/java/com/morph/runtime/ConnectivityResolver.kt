package com.morph.runtime

import com.morph.runtime.domain.Connectivity

object ConnectivityResolver {
    fun resolve(serverReachable: Boolean, validatedInternet: Boolean): Connectivity = when {
        !serverReachable -> Connectivity.ISOLATED
        validatedInternet -> Connectivity.ONLINE
        else -> Connectivity.LOCAL
    }
}
