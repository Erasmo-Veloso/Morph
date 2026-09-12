package com.morph.runtime

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities

class ConnectivityMonitor(context: Context) {
    private val manager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private var callback: ConnectivityManager.NetworkCallback? = null

    fun hasValidatedInternet(): Boolean {
        val network = manager.activeNetwork ?: return false
        val capabilities = manager.getNetworkCapabilities(network) ?: return false
        val supportedTransport = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
        return supportedTransport && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }

    fun start(onChanged: () -> Unit) {
        if (callback != null) return
        callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) = onChanged()
            override fun onLost(network: Network) = onChanged()
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) = onChanged()
        }.also { manager.registerDefaultNetworkCallback(it) }
        onChanged()
    }

    fun stop() { callback?.let { manager.unregisterNetworkCallback(it) }; callback = null }
}
