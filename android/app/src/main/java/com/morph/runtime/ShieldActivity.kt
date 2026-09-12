package com.morph.runtime

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.morph.runtime.domain.PhaseType

class ShieldActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val phase = intent.getStringExtra(PHASE_TYPE)?.let { runCatching { PhaseType.valueOf(it) }.getOrNull() }
        setContent {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(28.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.Start
            ) {
                Image(
                    painter = painterResource(R.drawable.morph_mark),
                    contentDescription = "Logótipo Morph",
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.width(70.dp).height(48.dp)
                )
                Text("morph", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
                Text("AULAS QUE TRANSFORMAM", color = Muted, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp, modifier = Modifier.padding(top = 2.dp))
                Text("MORPH SHIELD", color = Blue, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.3.sp, modifier = Modifier.padding(top = 42.dp))
                Text("A sua atenção continua na aula.", color = Navy, fontSize = 28.sp, lineHeight = 34.sp, modifier = Modifier.padding(top = 18.dp))
                Text("Esta aplicação não faz parte da etapa ${phase?.let(::phaseLabel) ?: "actual"}.", color = Muted, fontSize = 16.sp, lineHeight = 23.sp, modifier = Modifier.padding(top = 18.dp))
                Text("Volte à aula para continuar a Capsule.", color = Muted, fontSize = 16.sp, modifier = Modifier.padding(top = 8.dp, bottom = 28.dp))
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        startActivity(Intent(this@ShieldActivity, MainActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                        })
                        finish()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Blue, contentColor = Color.White)
                ) { Text("Voltar à aula") }
            }
        }
    }

    private fun phaseLabel(phase: PhaseType) = when (phase) {
        PhaseType.UNDERSTAND -> "COMPREENDER"
        PhaseType.MEASURE -> "MEDIR"
        PhaseType.ANALYSE -> "ANALISAR"
        PhaseType.REFLECT -> "REFLECTIR"
    }

    companion object {
        const val PACKAGE_NAME = "packageName"
        const val PHASE_TYPE = "phaseType"
    }
}

private val Navy = Color(0xFF101B3A)
private val Blue = Color(0xFF287BEA)
private val Muted = Color(0xFF66738A)
