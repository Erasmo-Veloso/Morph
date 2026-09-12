package com.morph.runtime

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.morph.runtime.domain.PhaseType

class ShieldActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val phase = intent.getStringExtra(PHASE_TYPE)?.let { runCatching { PhaseType.valueOf(it) }.getOrNull() }
        setContent {
            Column(modifier = Modifier.fillMaxSize().background(Color(0xFF101114)).padding(28.dp), verticalArrangement = Arrangement.Center) {
                Text("MORPH SHIELD", color = Color(0xFFD8FF63), fontSize = 13.sp)
                Text("Esta aplicação não faz parte da etapa actual.", color = Color.White, fontSize = 28.sp, modifier = Modifier.padding(top = 18.dp))
                Text("Etapa actual: ${phase?.name ?: "aula"}", color = Color(0xFF9BA5B6), fontSize = 16.sp, modifier = Modifier.padding(top = 18.dp))
                Text("Volte à aula para continuar a Capsule.", color = Color(0xFF9BA5B6), fontSize = 16.sp, modifier = Modifier.padding(top = 8.dp, bottom = 28.dp))
                Button(onClick = { finish() }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD8FF63), contentColor = Color(0xFF101114))) { Text("Voltar à aula") }
            }
        }
    }

    companion object {
        const val PACKAGE_NAME = "packageName"
        const val PHASE_TYPE = "phaseType"
    }
}

