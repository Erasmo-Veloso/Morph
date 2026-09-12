package com.morph.runtime

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.morph.runtime.domain.Capability
import com.morph.runtime.domain.Connectivity
import com.morph.runtime.domain.PhaseType

class MainActivity : ComponentActivity() {
    private val app: MorphApplication get() = application as MorphApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MorphScreen(app) }
    }

    override fun onDestroy() {
        app.accelerometer.stop()
        super.onDestroy()
    }
}

@Composable
private fun MorphScreen(app: MorphApplication) {
    val context = LocalContext.current
    val runtime by app.engine.state.collectAsState()
    val samples by app.accelerometer.samples.collectAsState()
    val magnitude by app.accelerometer.magnitude.collectAsState()
    val phase = runtime.currentPhase

    LaunchedEffect(runtime.running, phase?.type) {
        if (runtime.running && phase?.type == PhaseType.MEASURE) app.accelerometer.start() else app.accelerometer.stop()
    }
    DisposableEffect(Unit) { onDispose { app.accelerometer.stop() } }

    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        Column(modifier = Modifier.padding(horizontal = 24.dp, vertical = 36.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            Text("MORPH", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            Text("${phase?.title ?: "A sua aula"}", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Bold)
            Text(runtime.status, color = Muted, fontSize = 15.sp)
            StatusRow(runtime.connectivity.name, runtime.running)
            androidx.compose.material3.TextButton(onClick = { context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }) {
                Text("Abrir permissões de protecção", color = Accent)
            }

            if (phase?.type == PhaseType.MEASURE) {
                MeasureCard(samples, magnitude)
            } else {
                PhaseCard(runtime.stage.name, phase?.capabilities ?: emptySet())
            }

            Text("A Capsule muda o que o smartphone pode fazer em cada etapa.", color = Muted, fontSize = 14.sp)
        }
    }
}

@Composable
private fun StatusRow(connectivity: String, running: Boolean) {
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
        Badge(if (running) "EM AULA" else "A AGUARDAR", if (running) Accent else Muted)
        Badge(connectivity, if (connectivity == Connectivity.ISOLATED.name) Warning else Muted)
    }
}

@Composable
private fun PhaseCard(type: String, capabilities: Set<Capability>) {
    Box(modifier = Modifier.fillMaxWidth().background(Card, RoundedCornerShape(20.dp)).padding(20.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text(type, color = Accent, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
            Text("Capacidades activas", color = Color.White, fontSize = 21.sp, fontWeight = FontWeight.SemiBold)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(capabilities.toList()) { Badge(it.name, Color.White) } }
        }
    }
}

@Composable
private fun MeasureCard(samples: List<Float>, magnitude: Float) {
    Box(modifier = Modifier.fillMaxWidth().background(Card, RoundedCornerShape(20.dp)).padding(20.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                Column {
                    Text("MEASURE", color = Accent, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                    Spacer(Modifier.height(5.dp))
                    Text("Acelerómetro real", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
                }
                Text(String.format("%.2f m/s²", magnitude), color = Accent, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            SensorChart(samples)
            Text("Mova o dispositivo para alterar o gráfico.", color = Muted, fontSize = 13.sp)
        }
    }
}

@Composable
private fun SensorChart(samples: List<Float>) {
    Canvas(modifier = Modifier.fillMaxWidth().height(150.dp)) {
        drawLine(Muted.copy(alpha = .25f), Offset(0f, size.height * .5f), Offset(size.width, size.height * .5f), 1f)
        if (samples.size < 2) return@Canvas
        val max = maxOf(samples.maxOrNull() ?: 1f, 1f)
        val path = Path()
        samples.forEachIndexed { index, value ->
            val x = size.width * index / (samples.size - 1).toFloat()
            val y = size.height - (value / max).coerceIn(0f, 1f) * size.height
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        drawPath(path, Accent, style = Stroke(width = 4f))
    }
}

@Composable
private fun Badge(label: String, color: Color) {
    Text(label, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.background(color.copy(alpha = .12f), RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 7.dp))
}

private val Background = Color(0xFF101114)
private val Card = Color(0xFF1A1D23)
private val Accent = Color(0xFFD8FF63)
private val Muted = Color(0xFF9BA5B6)
private val Warning = Color(0xFFFFC857)
