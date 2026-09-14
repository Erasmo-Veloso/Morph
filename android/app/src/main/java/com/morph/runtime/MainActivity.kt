package com.morph.runtime

import android.graphics.Color as AndroidColor
import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.keyframes
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.Policy
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.morph.runtime.domain.Capability
import com.morph.runtime.domain.Connectivity
import com.morph.runtime.domain.PhaseType
import com.morph.runtime.domain.RuntimeStage
import kotlin.math.cos
import kotlin.math.sin
import java.util.Locale

class MainActivity : ComponentActivity() {
    private val app: MorphApplication get() = application as MorphApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = AndroidColor.WHITE
        window.navigationBarColor = AndroidColor.WHITE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
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
    var splashVisible by remember { mutableStateOf(true) }

    LaunchedEffect(runtime.running, phase?.type) {
        if (runtime.running && phase?.type == PhaseType.MEASURE) app.accelerometer.start() else app.accelerometer.stop()
    }
    DisposableEffect(Unit) { onDispose { app.accelerometer.stop() } }

    Box(modifier = Modifier.fillMaxSize()) {
        Surface(modifier = Modifier.fillMaxSize(), color = Paper) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 18.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                BrandHeader()
                RuntimeStrip(runtime.connectivity, runtime.running)
                TextButton(
                    onClick = { context.startActivity(android.content.Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
                    modifier = Modifier.align(Alignment.Start)
                ) {
                    Icon(Icons.Outlined.Settings, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Abrir permissões de protecção", color = PrimaryBlue, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                AnimatedContent(targetState = runtime.stage, label = "runtime-stage") { stage ->
                    when (stage) {
                        RuntimeStage.IDLE,
                        RuntimeStage.CAPSULE_RECEIVED,
                        RuntimeStage.READY -> WelcomeState(runtime.status)
                        RuntimeStage.UNDERSTAND -> UnderstandState(phase?.title ?: "Compreender")
                        RuntimeStage.MEASURE -> MeasureState(samples, magnitude)
                        RuntimeStage.ANALYSE,
                        RuntimeStage.REFLECT -> ActivePhaseState(stage, phase?.title ?: stage.name, phase?.capabilities ?: emptySet())
                        RuntimeStage.FINISHED -> FinishedState()
                    }
                }

                Text(
                    "A Capsule muda o que o smartphone pode fazer em cada etapa.",
                    color = Muted,
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                FooterMark()
            }
        }

        if (splashVisible) {
            MorphTransformationSplash(
                selected = splashModeFor(phase?.type),
                onFinished = { splashVisible = false }
            )
        }
    }
}

private enum class SplashMode(val title: String, val icon: ImageVector, val tint: Color) {
    UNDERSTAND("COMPREENDER", Icons.Outlined.MenuBook, Color(0xFF2875EA)),
    SHIELD("MORPH SHIELD", Icons.Outlined.Eco, Color(0xFF27B878)),
    MEASURE("MEDIR", Icons.Outlined.BarChart, Color(0xFF1F6BFF))
}

private fun splashModeFor(phase: PhaseType?): SplashMode = when (phase) {
    PhaseType.MEASURE,
    PhaseType.ANALYSE -> SplashMode.MEASURE
    PhaseType.REFLECT -> SplashMode.SHIELD
    else -> SplashMode.UNDERSTAND
}

@Composable
private fun MorphTransformationSplash(selected: SplashMode, onFinished: () -> Unit) {
    val progress = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        progress.animateTo(
            targetValue = 1f,
            animationSpec = keyframes {
                durationMillis = 3_400
                0f at 0
                .18f at 420
                .54f at 1_500
                .78f at 2_450
                1f at 3_400
            }
        )
        onFinished()
    }

    val value = progress.value
    val convergeProgress = ((value - .47f) / .38f).coerceIn(0f, 1f)
    val closeProgress = ((value - .82f) / .18f).coerceIn(0f, 1f)
    val titleAlpha = ((value - .03f) / .16f).coerceIn(0f, 1f) * (1f - closeProgress)

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .background(Paper),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val trailColor = BorderBlue.copy(alpha = .2f * (1f - convergeProgress))
            val trails = listOf(
                Triple(Offset(size.width * .09f, size.height * .27f), Offset(size.width * .33f, size.height * .06f), Offset(size.width * .47f, size.height * .44f)),
                Triple(Offset(size.width * .9f, size.height * .24f), Offset(size.width * .67f, size.height * .07f), Offset(size.width * .57f, size.height * .4f)),
                Triple(Offset(size.width * .78f, size.height * .86f), Offset(size.width * .96f, size.height * .63f), Offset(size.width * .55f, size.height * .58f))
            )
            trails.forEach { (start, control, end) ->
                val path = Path().apply {
                    moveTo(start.x, start.y)
                    cubicTo(control.x, control.y, control.x, control.y, end.x, end.y)
                }
                drawPath(path, trailColor, style = Stroke(width = 1.5f))
            }
        }

        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 42.dp)
                .graphicsLayer { alpha = titleAlpha },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(7.dp)
        ) {
            Image(painter = painterResource(R.drawable.morph_logo), contentDescription = "Morph", modifier = Modifier.width(148.dp).height(54.dp))
            Text("AULA AO VIVO", color = PrimaryBlue, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        }

        val anchorX = listOf(maxWidth.value * .2f, maxWidth.value * .82f, maxWidth.value * .7f)
        val anchorY = listOf(maxHeight.value * .29f, maxHeight.value * .27f, maxHeight.value * .78f)
        SplashMode.values().forEachIndexed { index, mode ->
            val selectedMode = mode == selected
            val alpha = if (selectedMode) 1f else 1f - convergeProgress * .9f
            val wander = value * 6.2f + index * 1.9f
            val drift = if (selectedMode) 1f - convergeProgress else 1f
            val x = anchorX[index] + (maxWidth.value / 2f - anchorX[index]) * convergeProgress + sin(wander) * maxWidth.value * .065f * drift
            val y = anchorY[index] + (maxHeight.value / 2f - anchorY[index]) * convergeProgress + cos(wander * .82f) * maxHeight.value * .055f * drift
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset((x - maxWidth.value / 2f).dp, (y - maxHeight.value / 2f).dp)
                    .graphicsLayer {
                        this.alpha = alpha
                        val scale = if (selectedMode) 1f + convergeProgress * .34f else 1f - convergeProgress * .14f
                        scaleX = scale
                        scaleY = scale
                        rotationZ = wander * if (selectedMode) 14f else 22f
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Icon(mode.icon, contentDescription = mode.title, tint = mode.tint, modifier = Modifier.size(if (selectedMode) 54.dp else 46.dp))
                    Text(mode.title, color = mode.tint, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = .8.sp)
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .size(width = 148.dp, height = 274.dp)
                .graphicsLayer {
                    alpha = ((convergeProgress - .22f) / .56f).coerceIn(0f, 1f) * (1f - closeProgress)
                    val scale = .84f + convergeProgress * .16f
                    scaleX = scale
                    scaleY = scale
                }
                .background(Color.White, RoundedCornerShape(28.dp))
                .border(3.dp, Navy, RoundedCornerShape(28.dp))
                .padding(13.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("9:41", color = Muted, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                    Text("5G · ▮", color = Muted, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                }
                Icon(selected.icon, contentDescription = null, tint = selected.tint, modifier = Modifier.padding(top = 18.dp).size(34.dp))
                Text(selected.title, color = Navy, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = .5.sp)
                Box(modifier = Modifier.width(28.dp).height(3.dp).background(PrimaryBlue))
                Text("A ferramenta certa\npara esta fase.", color = Muted, fontSize = 10.sp, lineHeight = 13.sp)
                Box(modifier = Modifier.fillMaxWidth().height(58.dp).background(LightBlue, RoundedCornerShape(10.dp)).padding(8.dp)) {
                    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text(if (selected == SplashMode.MEASURE) "Dados do movimento" else "Conteúdo da aula", color = Navy, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        repeat(3) { Box(modifier = Modifier.fillMaxWidth(if (it == 1) .72f else .9f).height(4.dp).background(BorderBlue, RoundedCornerShape(3.dp))) }
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 42.dp)
                .graphicsLayer { alpha = titleAlpha },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {
            Text("O smartphone metamorfoseia-se", color = Navy, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            Text("conforme a aprendizagem", color = Muted, fontSize = 13.sp)
        }
    }
}

@Composable
private fun BrandHeader() {
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
        Image(
            painter = painterResource(id = R.drawable.morph_logo),
            contentDescription = "Morph",
            modifier = Modifier.width(154.dp).height(58.dp)
        )
        Spacer(Modifier.weight(1f))
        Column(horizontalAlignment = Alignment.End) {
            Text("HACKTUDO 2026", color = Navy, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            Spacer(Modifier.height(10.dp))
            Box(modifier = Modifier.width(32.dp).height(3.dp).background(PrimaryBlue))
        }
    }
}

@Composable
private fun RuntimeStrip(connectivity: Connectivity, running: Boolean) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
        StatusMark(if (running) "EM AULA" else "A AGUARDAR", running)
        Text("·", color = BorderBlue, fontWeight = FontWeight.Bold)
        StatusMark(if (connectivity == Connectivity.ISOLATED) "OFFLINE" else "ONLINE", connectivity != Connectivity.ISOLATED)
    }
}

@Composable
private fun StatusMark(label: String, active: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(modifier = Modifier.size(7.dp).background(if (active) PrimaryBlue else Muted, CircleShape))
        Text(label, color = Navy, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    }
}

@Composable
private fun WelcomeState(status: String) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("UMA NOVA RELAÇÃO COM O SMARTPHONE")
        Text("O smartphone\nmetamorfoseia-se\nconforme a aprendizagem.", color = Navy, fontSize = 34.sp, lineHeight = 36.sp, fontWeight = FontWeight.Bold)
        BlueRule()
        Text("Aulas que transformam. Uma ferramenta certa para cada fase.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        QuoteBlock("A Capsule está pronta para receber a intenção pedagógica.", status)
    }
}

@Composable
private fun UnderstandState(title: String) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · 01 / 04")
        Text("Compreender", color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("O telefone certo para cada momento da aula.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.MenuBook, "aprender", "Conteúdos no momento certo.") {
            Text(title, color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Explora o fenómeno no contexto real e regista a tua hipótese antes de medir.", color = Muted, fontSize = 15.sp, lineHeight = 21.sp)
        }
        PhaseProgress(active = 0)
    }
}

@Composable
private fun MeasureState(samples: List<Float>, magnitude: Float) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · 02 / 04")
        Text("Experimentar", color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("Dados do movimento.", color = Muted, fontSize = 18.sp)
        BlueRule()
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(LightBlue, RoundedCornerShape(24.dp))
                .padding(18.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Eyebrow("MEDIR")
                        Text("Acelerómetro real", color = Navy, fontSize = 21.sp, fontWeight = FontWeight.Bold)
                        Text("Dados recolhidos pelo dispositivo.", color = Muted, fontSize = 13.sp)
                    }
                    Text(String.format(Locale.US, "%.2f", magnitude), color = PrimaryBlue, fontSize = 25.sp, fontWeight = FontWeight.Bold)
                }
                Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("m/s²", color = PrimaryBlue, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Box(modifier = Modifier.weight(1f).height(1.dp).background(BorderBlue))
                }
                SensorChart(samples)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("0 s", color = Muted, fontSize = 11.sp)
                    Text("tempo da experiência", color = Muted, fontSize = 11.sp)
                    Text("agora", color = Muted, fontSize = 11.sp)
                }
            }
        }
        FeatureCard(Icons.Outlined.BarChart, "medir", "Sensores do smartphone recolhem dados reais.") {
            Text("Move o dispositivo para alterar o gráfico.", color = Navy, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        PhaseProgress(active = 1)
    }
}

@Composable
private fun ActivePhaseState(stage: RuntimeStage, title: String, capabilities: Set<Capability>) {
    val isReflect = stage == RuntimeStage.REFLECT
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · ${if (isReflect) "04" else "03"} / 04")
        Text(title, color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text(if (isReflect) "Comunicar conclusões e propor soluções." else "Tratar os dados e encontrar padrões.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        FeatureCard(if (isReflect) Icons.Outlined.Eco else Icons.Outlined.Insights, if (isReflect) "reflectir" else "analisar", if (isReflect) "Desenvolver hábitos para um uso mais consciente." else "Perceber padrões e identificar oportunidades.") {
            Text(if (isReflect) "O que concluis?" else "Padrão de movimento", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(if (isReflect) "Regista a tua ideia principal e fecha o ciclo da experiência." else "A Capsule prepara os dados recolhidos para apoiar a tua leitura.", color = Muted, fontSize = 15.sp, lineHeight = 21.sp)
            if (!isReflect) {
                Spacer(Modifier.height(6.dp))
                AnalysisSummary()
            }
            if (capabilities.isNotEmpty()) {
                Spacer(Modifier.height(12.dp))
                CapabilityLine(capabilities)
            }
        }
        PhaseProgress(active = if (isReflect) 3 else 2)
    }
}

@Composable
private fun AnalysisSummary() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(LightBlue, RoundedCornerShape(18.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("RESUMO LOCAL", color = PrimaryBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
        Text("Padrão de movimento", color = Navy, fontSize = 17.sp, fontWeight = FontWeight.Bold)
        Text("Os dados recolhidos estão prontos para interpretar.", color = Muted, fontSize = 12.sp)
        Canvas(modifier = Modifier.fillMaxWidth().height(76.dp)) {
            val values = listOf(.28f, .48f, .4f, .72f, .9f, .64f)
            val gap = 8.dp.toPx()
            val barWidth = (size.width - gap * (values.size - 1)) / values.size
            values.forEachIndexed { index, value ->
                val left = index * (barWidth + gap)
                drawRoundRect(
                    color = PrimaryBlue,
                    topLeft = Offset(left, size.height * (1f - value)),
                    size = androidx.compose.ui.geometry.Size(barWidth, size.height * value),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )
            }
        }
        Text("Média: 1,2 m/s²   ·   Pico: 2,4 m/s²", color = Navy, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun FinishedState() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · CONCLUÍDA")
        Text("A aula terminou.", color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("A relação com o smartphone continua a mudar.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        Box(modifier = Modifier.fillMaxWidth().background(LightBlue, RoundedCornerShape(24.dp)).padding(20.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(modifier = Modifier.size(34.dp).background(PrimaryBlue, CircleShape), contentAlignment = Alignment.Center) {
                        Icon(Icons.Outlined.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                    Text("Sessão terminada", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
                Text("A policy foi limpa. O Sentinel guardou apenas os eventos mínimos da sessão.", color = Muted, fontSize = 15.sp, lineHeight = 21.sp)
            }
        }
        StatusCard()
    }
}

@Composable
private fun FeatureCard(icon: ImageVector, label: String, description: String, content: @Composable () -> Unit) {
    Box(modifier = Modifier.fillMaxWidth().border(1.dp, BorderBlue, RoundedCornerShape(24.dp)).padding(18.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(modifier = Modifier.size(44.dp).background(LightBlue, CircleShape), contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(23.dp))
                }
                Column {
                    Text(label, color = Navy, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text(description, color = Muted, fontSize = 13.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
            }
            content()
        }
    }
}

@Composable
private fun CapabilityLine(capabilities: Set<Capability>) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Outlined.Policy, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(18.dp))
        Text(capabilities.joinToString(" · ") { it.name }, color = PrimaryBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    }
}

@Composable
private fun StatusCard() {
    Row(modifier = Modifier.fillMaxWidth().border(1.dp, BorderBlue, RoundedCornerShape(18.dp)).padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Icon(Icons.Outlined.Policy, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(23.dp))
        Column {
            Text("FINISHED", color = PrimaryBlue, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
            Text("Policy limpa · dados locais sincronizáveis", color = Navy, fontSize = 14.sp)
        }
    }
}

@Composable
private fun QuoteBlock(text: String, status: String) {
    Column(modifier = Modifier.fillMaxWidth().background(LightBlue, RoundedCornerShape(20.dp)).padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(text, color = Navy, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, lineHeight = 22.sp)
        Text(status, color = Muted, fontSize = 13.sp)
    }
}

@Composable
private fun PhaseProgress(active: Int) {
    val labels = listOf("COMPREENDER", "MEDIR", "ANALISAR", "REFLECTIR")
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            labels.forEachIndexed { index, _ ->
                Box(modifier = Modifier.size(10.dp).background(if (index <= active) PrimaryBlue else BorderBlue, CircleShape))
                if (index < labels.lastIndex) Spacer(Modifier.weight(1f).height(2.dp).background(if (index < active) PrimaryBlue else BorderBlue))
            }
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            labels.forEachIndexed { index, label ->
                Text(label, color = if (index == active) Navy else Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = .8.sp)
            }
        }
    }
}

@Composable
private fun SensorChart(samples: List<Float>) {
    Canvas(modifier = Modifier.fillMaxWidth().height(160.dp)) {
        val values = samples.takeLast(60)
        for (index in 0..3) {
            val y = size.height * index / 3f
            drawLine(BorderBlue.copy(alpha = .7f), Offset(0f, y), Offset(size.width, y), 1f)
        }
        if (values.size < 2) return@Canvas
        val min = values.minOrNull() ?: 0f
        val max = maxOf(values.maxOrNull() ?: 1f, min + 1f)
        val path = Path()
        values.forEachIndexed { index, value ->
            val x = size.width * index / (values.size - 1).toFloat()
            val y = size.height - ((value - min) / (max - min)).coerceIn(0f, 1f) * size.height
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        drawPath(path, PrimaryBlue, style = Stroke(width = 5f, cap = StrokeCap.Round))
    }
}

@Composable
private fun Eyebrow(text: String) {
    Text(text, color = PrimaryBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
}

@Composable
private fun BlueRule() {
    Box(modifier = Modifier.width(46.dp).height(4.dp).background(PrimaryBlue))
}

@Composable
private fun FooterMark() {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(modifier = Modifier.width(24.dp).height(3.dp).background(PrimaryBlue))
            Text("MORPH · AULAS QUE TRANSFORMAM", color = Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = .9.sp)
        }
        Text("RUNTIME", color = Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
    }
}

private val Paper = Color(0xFFFFFFFF)
private val Navy = Color(0xFF14254D)
private val PrimaryBlue = Color(0xFF1F6BFF)
private val LightBlue = Color(0xFFEAF3FF)
private val BorderBlue = Color(0xFFBCD7FA)
private val Muted = Color(0xFF627493)
