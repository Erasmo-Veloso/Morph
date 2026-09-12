package com.morph.runtime

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
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
    val pendingEvents by app.sentinel.pendingCount.collectAsState(initial = 0)
    val phase = runtime.currentPhase

    LaunchedEffect(runtime.running, phase?.type) {
        if (runtime.running && phase?.type == PhaseType.MEASURE) app.accelerometer.start() else app.accelerometer.stop()
    }
    DisposableEffect(Unit) { onDispose { app.accelerometer.stop() } }

    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        Column(
            modifier = Modifier
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            BrandHeader(runtime.running)
            Text(phase?.title ?: "A sua aula", color = Navy, fontSize = 40.sp, fontWeight = FontWeight.Bold)
            Text(phaseDescription(phase?.type), color = Muted, fontSize = 16.sp, lineHeight = 23.sp)
            PhaseProgress(phase?.type)
            StatusRow(runtime.connectivity.name, pendingEvents)
            androidx.compose.material3.TextButton(onClick = { context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }) {
                Text("Protecção da aula · permissões", color = Blue, fontSize = 13.sp)
            }

            if (phase?.type == PhaseType.MEASURE) {
                MeasureCard(samples, magnitude)
            } else {
                PhaseCard(phase?.type, phase?.capabilities ?: emptySet())
            }

            Text("O smartphone metamorfoseia-se conforme a aprendizagem.", color = Muted, fontSize = 14.sp, lineHeight = 20.sp)
        }
    }
}

@Composable
private fun BrandHeader(running: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Image(
                painter = painterResource(R.drawable.morph_mark),
                contentDescription = "Logótipo Morph",
                contentScale = ContentScale.Fit,
                modifier = Modifier.width(58.dp).height(40.dp)
            )
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text("morph", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("AULAS QUE TRANSFORMAM", color = Muted, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
            }
        }
        Text(
            if (running) "AULA ACTIVA" else "A AGUARDAR",
            color = if (running) Blue else Muted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = .8.sp
        )
    }
}

@Composable
private fun PhaseProgress(current: PhaseType?) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            PhaseType.entries.forEachIndexed { index, type ->
                val active = type == current
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .background(if (active) Blue else SoftSurface, RoundedCornerShape(50))
                        .border(1.dp, if (active) Blue else Track, RoundedCornerShape(50)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("${index + 1}", color = if (active) Color.White else Muted, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
                if (index < PhaseType.entries.lastIndex) {
                    Box(modifier = Modifier.weight(1f).height(2.dp).background(Track))
                }
            }
        }
        Row(modifier = Modifier.fillMaxWidth()) {
            PhaseType.entries.forEach { type ->
                Text(
                    phaseLabel(type),
                    color = if (type == current) Navy else Muted,
                    fontSize = 10.sp,
                    fontWeight = if (type == current) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun StatusRow(connectivity: String, pendingEvents: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(if (connectivity == Connectivity.ISOLATED.name) Warning else Green, RoundedCornerShape(50))
            )
            Text(if (connectivity == Connectivity.ISOLATED.name) "Ligação isolada" else "Ligado", color = Muted, fontSize = 12.sp)
        }
        Text(
            if (pendingEvents > 0) "SENTINEL · $pendingEvents pendente(s)" else "SENTINEL ACTIVO",
            color = if (pendingEvents > 0) Warning else Muted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = .5.sp
        )
    }
}

@Composable
private fun PhaseCard(type: PhaseType?, capabilities: Set<Capability>) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .border(1.dp, Track, RoundedCornerShape(24.dp))
            .padding(24.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("CAPSULE DE APRENDIZAGEM", color = Blue, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.3.sp)
            Text(phaseCardTitle(type), color = Navy, fontSize = 25.sp, fontWeight = FontWeight.SemiBold)
            Text(phaseCardDescription(type), color = Muted, fontSize = 14.sp, lineHeight = 20.sp)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(capabilities.toList()) { CapabilityChip(it) }
            }
        }
    }
}

@Composable
private fun CapabilityChip(capability: Capability) {
    Row(
        modifier = Modifier
            .background(SoftSurface, RoundedCornerShape(50))
            .padding(horizontal = 12.dp, vertical = 9.dp),
        horizontalArrangement = Arrangement.spacedBy(7.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(modifier = Modifier.size(7.dp).background(Blue, RoundedCornerShape(50)))
        Text(capabilityLabel(capability), color = Navy, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun MeasureCard(samples: List<Float>, magnitude: Float) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .border(1.dp, Track, RoundedCornerShape(24.dp))
            .padding(24.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                Column {
                    Text("EXPERIÊNCIA · MEDIR", color = Blue, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.3.sp)
                    Spacer(Modifier.height(5.dp))
                    Text("Acelerómetro real", color = Navy, fontSize = 25.sp, fontWeight = FontWeight.SemiBold)
                }
                Text(String.format("%.2f m/s²", magnitude), color = Blue, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            SensorChart(samples)
            Text("Mova o dispositivo para alterar o gráfico.", color = Muted, fontSize = 13.sp)
        }
    }
}

@Composable
private fun SensorChart(samples: List<Float>) {
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(150.dp)
            .background(SoftSurface, RoundedCornerShape(18.dp))
    ) {
        drawLine(Track, Offset(0f, size.height * .5f), Offset(size.width, size.height * .5f), 1f)
        if (samples.size < 2) return@Canvas
        val max = maxOf(samples.maxOrNull() ?: 1f, 1f)
        val path = Path()
        samples.forEachIndexed { index, value ->
            val x = size.width * index / (samples.size - 1).toFloat()
            val y = size.height - (value / max).coerceIn(0f, 1f) * size.height
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        drawPath(path, Blue, style = Stroke(width = 4f))
    }
}

private fun phaseLabel(type: PhaseType) = when (type) {
    PhaseType.UNDERSTAND -> "COMPREENDER"
    PhaseType.MEASURE -> "MEDIR"
    PhaseType.ANALYSE -> "ANALISAR"
    PhaseType.REFLECT -> "REFLECTIR"
}

private fun capabilityLabel(capability: Capability) = when (capability) {
    Capability.LEARNING_CONTENT -> "Conteúdo"
    Capability.GUIDED_EXPLANATION -> "Orientação"
    Capability.ACCELEROMETER -> "Acelerómetro"
    Capability.GYROSCOPE -> "Giroscópio"
    Capability.CAMERA -> "Câmara"
    Capability.CHRONOMETER -> "Cronómetro"
    Capability.COLLECTED_DATA -> "Dados locais"
    Capability.GRAPH -> "Gráfico"
    Capability.CALCULATOR -> "Calculadora"
    Capability.EXIT_TICKET -> "Reflexão"
}

private fun phaseDescription(type: PhaseType?) = when (type) {
    PhaseType.UNDERSTAND -> "Aprenda o conceito antes de o medir."
    PhaseType.MEASURE -> "O telefone transforma-se num instrumento de experiência."
    PhaseType.ANALYSE -> "Interprete os dados recolhidos durante a experiência."
    PhaseType.REFLECT -> "Registe o que aprendeu e formule a sua conclusão."
    null -> "A Capsule está pronta para transformar esta aula."
}

private fun phaseCardTitle(type: PhaseType?) = when (type) {
    PhaseType.UNDERSTAND -> "Comece por compreender"
    PhaseType.ANALYSE -> "Dados para interpretar"
    PhaseType.REFLECT -> "Uma conclusão sua"
    else -> "Capacidades activas"
}

private fun phaseCardDescription(type: PhaseType?) = when (type) {
    PhaseType.UNDERSTAND -> "Conteúdo e explicação guiada ficam disponíveis nesta etapa."
    PhaseType.ANALYSE -> "Os resultados permanecem locais e tornam-se evidência para a análise."
    PhaseType.REFLECT -> "A aula termina com uma reflexão individual, não com mais distracção."
    null -> "Aguarde o início da Capsule para ver as capacidades desta etapa."
    else -> "A Capsule activa apenas as capacidades necessárias nesta etapa."
}

private val Background = Color.White
private val Card = Color.White
private val Navy = Color(0xFF101B3A)
private val Blue = Color(0xFF287BEA)
private val Green = Color(0xFF35B987)
private val SoftSurface = Color(0xFFF4F7FB)
private val Track = Color(0xFFE2E8F1)
private val Muted = Color(0xFF66738A)
private val Warning = Color(0xFFB46A00)
