package com.morph.runtime

import android.graphics.Color as AndroidColor
import android.content.Context
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.Policy
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
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
import com.morph.runtime.domain.BubbleStatus
import com.morph.runtime.domain.DeviceEnrollment
import com.morph.runtime.domain.SchoolContext
import com.morph.runtime.domain.PhaseType
import com.morph.runtime.domain.Phase
import com.morph.runtime.domain.AllowedApp
import com.morph.runtime.domain.PedagogicalAppPolicy
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
                modifier = Modifier.fillMaxSize()
            ) {
                StudentTopBar()
                SchoolContextPill()
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 24.dp, vertical = 14.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp)
                ) {
                    RuntimeStrip(runtime.connectivity, runtime.running, runtime.bubbleStatus)
                    if (runtime.running && runtime.connectivity != Connectivity.ONLINE) {
                        Text(
                            when (runtime.connectivity) {
                                Connectivity.LOCAL -> "LOCAL · A aula continua neste dispositivo."
                                Connectivity.ISOLATED -> "OFFLINE · A aula continua neste dispositivo."
                                Connectivity.ONLINE -> ""
                            },
                            color = Muted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    if (runtime.running && phase != null) CapsuleHeader(phase.type)
                    if (runtime.running && phase != null) AllowedAppShortcuts(phase, context)
                    if (runtime.schoolBubbleName != null && runtime.bubbleStatus == BubbleStatus.DEMO_READY) {
                        Text("${runtime.schoolBubbleName} · pronta para demonstração", color = PrimaryBlue, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    TextButton(
                        onClick = { context.startActivity(android.content.Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
                        modifier = Modifier.align(Alignment.Start)
                    ) {
                        Icon(Icons.Outlined.Settings, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Abrir permissões de protecção", color = PrimaryBlue, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }

                    AnimatedContent(targetState = Triple(runtime.enrollment, runtime.schoolContext, runtime.stage), label = "runtime-stage") { (_, schoolContext, stage) ->
                        when {
                            runtime.enrollment == DeviceEnrollment.UNENROLLED -> EnrollmentState(onPair = app.session::pairDevice)
                            schoolContext == SchoolContext.OUTSIDE_SCHOOL -> OutsideSchoolState()
                            schoolContext == SchoolContext.SCHOOL_UNVERIFIED && runtime.running -> UnverifiedContextState()
                            schoolContext == SchoolContext.SCHOOL_VERIFIED && !runtime.running && stage == RuntimeStage.IDLE -> SchoolIdleState()
                            else -> when (stage) {
                                RuntimeStage.IDLE,
                                RuntimeStage.CAPSULE_RECEIVED,
                                RuntimeStage.READY -> WelcomeState(runtime.status)
                                RuntimeStage.UNDERSTAND -> UnderstandState(phase?.title ?: "Compreender")
                                RuntimeStage.MEASURE -> MeasureState(samples, magnitude)
                                RuntimeStage.ANALYSE -> AnalyseState(samples)
                                RuntimeStage.REFLECT -> ReflectState(runtime.capsuleId, app.reflections)
                                RuntimeStage.BREAK -> BreakState(onFinish = app.session::finishBreak)
                                RuntimeStage.FINISHED -> FinishedState()
                            }
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
                StudentBottomNav()
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

@Composable
private fun EnrollmentState(onPair: (String) -> Unit) {
    var code by remember { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("DISPOSITIVO · ASSOCIAÇÃO")
        Text("Associar este telefone.", color = Navy, fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Text("O código liga este dispositivo ao Aluno demo e ao Colégio Horizonte. Sem associação, a escola não aplica qualquer política.", color = Muted, fontSize = 16.sp, lineHeight = 22.sp)
        BlueRule()
        OutlinedTextField(value = code, onValueChange = { code = it.uppercase(Locale.ROOT) }, singleLine = true, label = { Text("Código de associação") }, placeholder = { Text("MORPH-2026") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = { onPair(code) }, enabled = code.isNotBlank(), colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth().height(52.dp)) {
            Text("Associar dispositivo", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun SchoolIdleState() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("COLÉGIO HORIZONTE · CONTEXTO VERIFICADO")
        Text("Na escola.\nSem restrições.", color = Navy, fontSize = 33.sp, lineHeight = 38.sp, fontWeight = FontWeight.Bold)
        Text("A escola reconhece o contexto, mas só uma Capsule activa pode orientar este telefone.", color = Muted, fontSize = 17.sp, lineHeight = 24.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.Check, "autoridade", "À espera da próxima aula.") { Text("O telefone continua disponível até o professor iniciar uma Capsule.", color = Navy, fontSize = 16.sp, fontWeight = FontWeight.SemiBold) }
    }
}

@Composable
private fun OutsideSchoolState() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("MORPH · FORA DA ESCOLA")
        Box(modifier = Modifier.fillMaxWidth().background(LightBlue, RoundedCornerShape(28.dp)).padding(22.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Fora do contexto\nescolar", color = Navy, fontSize = 32.sp, lineHeight = 36.sp, fontWeight = FontWeight.Bold)
                Text("O teu smartphone está totalmente disponível.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
                Box(modifier = Modifier.background(Color(0xFFDDF7EC), RoundedCornerShape(24.dp)).padding(horizontal = 14.dp, vertical = 9.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(modifier = Modifier.size(9.dp).background(Color(0xFF18B77A), CircleShape))
                        Text("Sem Capsule activa", color = Navy, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
        FeatureCard(Icons.Outlined.Eco, "autonomia", "Sem Capsule. Sem restrições.") {
            Text("Podes usar todas as aplicações livremente. O Morph volta a observar apenas o contexto pedagógico.", color = Navy, fontSize = 16.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun UnverifiedContextState() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CONTEXTO · A CONFIRMAR")
        Text("A aula continua\npor agora.", color = Navy, fontSize = 33.sp, lineHeight = 38.sp, fontWeight = FontWeight.Bold)
        Text("O sinal da escola deixou de ser suficiente. A Capsule mantém-se temporariamente e o professor é informado.", color = Muted, fontSize = 17.sp, lineHeight = 24.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.Policy, "unverified", "Política temporária e explicável.") { Text("Quando o contexto volta, a aula é verificada. Ao sair, todas as restrições são removidas.", color = Navy, fontSize = 16.sp, fontWeight = FontWeight.SemiBold) }
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
    val orbitProgress = ((value - .05f) / .55f).coerceIn(0f, 1f)
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
            val center = Offset(size.width / 2f, size.height / 2f)
            val radius = size.minDimension * (.3f - convergeProgress * .18f)
            drawCircle(BorderBlue.copy(alpha = .62f * (1f - convergeProgress)), radius, center, style = Stroke(width = 1.5f))
            drawCircle(BorderBlue.copy(alpha = .34f * (1f - convergeProgress)), radius * .72f, center, style = Stroke(width = 1f))
            repeat(3) { index ->
                val angle = -Math.PI.toFloat() / 2f + index * (Math.PI.toFloat() * 2f / 3f) + orbitProgress * .95f
                val point = Offset(center.x + cos(angle) * radius, center.y + sin(angle) * radius)
                drawLine(BorderBlue.copy(alpha = .2f * (1f - convergeProgress)), center, point, strokeWidth = 1f)
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
            Image(painter = painterResource(R.drawable.morph_logo_horizontal), contentDescription = "Morph", modifier = Modifier.width(148.dp).height(41.dp))
            Text("AULA AO VIVO", color = PrimaryBlue, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        }

        val orbitRadius = minOf(maxWidth.value, maxHeight.value) * .3f
        SplashMode.values().forEachIndexed { index, mode ->
            val angle = -Math.PI.toFloat() / 2f + index * (Math.PI.toFloat() * 2f / 3f) + orbitProgress * .95f
            val selectedMode = mode == selected
            val alpha = if (selectedMode) 1f else 1f - convergeProgress * .9f
            val radius = orbitRadius * (1f - convergeProgress * .78f)
            val x = cos(angle) * radius
            val y = sin(angle) * radius
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(x.dp, y.dp)
                    .graphicsLayer {
                        this.alpha = alpha
                        val scale = if (selectedMode) 1f + convergeProgress * .34f else 1f - convergeProgress * .14f
                        scaleX = scale
                        scaleY = scale
                        rotationZ = orbitProgress * 360f + index * 4f
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Box(
                        modifier = Modifier
                            .size(if (selectedMode) 70.dp else 60.dp)
                            .background(Color.White, CircleShape)
                            .border(2.dp, mode.tint, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(mode.icon, contentDescription = mode.title, tint = mode.tint, modifier = Modifier.size(28.dp))
                    }
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
private fun StudentTopBar() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 22.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = R.drawable.morph_logo_horizontal),
            contentDescription = "Morph",
            modifier = Modifier.width(132.dp).height(36.dp)
        )
        Spacer(Modifier.weight(1f))
        Icon(Icons.Outlined.NotificationsNone, contentDescription = "Notificações", tint = Navy, modifier = Modifier.size(25.dp))
        Spacer(Modifier.width(14.dp))
        Box(
            modifier = Modifier.size(36.dp).background(LightBlue, CircleShape).border(1.dp, BorderBlue, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Outlined.PersonOutline, contentDescription = "Perfil", tint = PrimaryBlue, modifier = Modifier.size(21.dp))
        }
    }
}

@Composable
private fun SchoolContextPill() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 18.dp, vertical = 4.dp)
            .background(LightBlue, RoundedCornerShape(18.dp))
            .border(1.dp, BorderBlue, RoundedCornerShape(18.dp))
            .padding(horizontal = 16.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(11.dp)
    ) {
        Icon(Icons.Outlined.School, contentDescription = null, tint = Navy, modifier = Modifier.size(23.dp))
        Text("Escola Secundária do Porto", color = Navy, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Spacer(Modifier.weight(1f))
        Text("›", color = Muted, fontSize = 27.sp, fontWeight = FontWeight.Light)
    }
}

@Composable
private fun StudentBottomNav() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, BorderBlue)
            .navigationBarsPadding()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        StudentNavItem(Icons.Outlined.Home, "Início", selected = true)
        StudentNavItem(Icons.Outlined.MenuBook, "Cápsulas")
        StudentNavItem(Icons.Outlined.BarChart, "Progresso")
        StudentNavItem(Icons.Outlined.PersonOutline, "Perfil")
    }
}

@Composable
private fun StudentNavItem(icon: ImageVector, label: String, selected: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Icon(icon, contentDescription = label, tint = if (selected) PrimaryBlue else Muted, modifier = Modifier.size(22.dp))
        Text(label, color = if (selected) PrimaryBlue else Muted, fontSize = 10.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
    }
}

@Composable
private fun CapsuleHeader(active: PhaseType) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Eyebrow("CÁPSULA")
        Text("Movimento Acelerado", color = Navy, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Text("Explorar o movimento no mundo real", color = Muted, fontSize = 15.sp)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            listOf(
                PhaseType.UNDERSTAND to ("Compreender" to Icons.Outlined.MenuBook),
                PhaseType.MEASURE to ("Medir" to Icons.Outlined.BarChart),
                PhaseType.ANALYSE to ("Analisar" to Icons.Outlined.Insights),
                PhaseType.REFLECT to ("Reflectir" to Icons.Outlined.EditNote)
            ).forEach { (type, item) ->
                CapsulePhaseItem(item.first, item.second, selected = active == type)
            }
        }
    }
}

@Composable
private fun CapsulePhaseItem(label: String, icon: ImageVector, selected: Boolean) {
    Column(
        modifier = Modifier
            .background(if (selected) LightBlue else Color.Transparent, RoundedCornerShape(14.dp))
            .padding(horizontal = 8.dp, vertical = 7.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(icon, contentDescription = label, tint = if (selected) PrimaryBlue else Navy, modifier = Modifier.size(25.dp))
        Text(label, color = if (selected) PrimaryBlue else Muted, fontSize = 11.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
        if (selected) Box(modifier = Modifier.width(32.dp).height(3.dp).background(PrimaryBlue, RoundedCornerShape(2.dp)))
    }
}

@Composable
private fun RuntimeStrip(connectivity: Connectivity, running: Boolean, bubbleStatus: BubbleStatus) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
        StatusMark(if (running) "EM AULA" else "A AGUARDAR", running)
        Text("·", color = BorderBlue, fontWeight = FontWeight.Bold)
        StatusMark(
            when (connectivity) {
                Connectivity.ONLINE -> "ONLINE"
                Connectivity.LOCAL -> "LOCAL"
                Connectivity.ISOLATED -> "OFFLINE"
            },
            connectivity != Connectivity.ISOLATED
        )
        Text("·", color = BorderBlue, fontWeight = FontWeight.Bold)
        StatusMark(bubbleStatus.label(), bubbleStatus == BubbleStatus.INSIDE || bubbleStatus == BubbleStatus.NOT_REQUIRED)
    }
}

private fun BubbleStatus.label() = when (this) {
    BubbleStatus.NOT_REQUIRED -> "SEM BUBBLE"
    BubbleStatus.DEMO_READY -> "BUBBLE · DEMO"
    BubbleStatus.CHECKING -> "A CONFIRMAR LOCAL"
    BubbleStatus.INSIDE -> "DENTRO DA ESCOLA"
    BubbleStatus.OUTSIDE -> "FORA DA ESCOLA"
    BubbleStatus.UNKNOWN -> "LOCALIZAÇÃO INDISPONÍVEL"
}

@Composable
private fun StatusMark(label: String, active: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(modifier = Modifier.size(7.dp).background(if (active) PrimaryBlue else Muted, CircleShape))
        Text(label, color = Navy, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    }
}

@Composable
private fun AllowedAppShortcuts(phase: Phase, context: Context) {
    val apps = PedagogicalAppPolicy.allowedApps(phase)
    if (apps.isEmpty()) {
        FeatureCard(Icons.Outlined.Policy, "modo foco", "Esta etapa acontece inteiramente no Morph.") {
            Text("Não há aplicações externas disponíveis agora.", color = Navy, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
        return
    }
    FeatureCard(Icons.Outlined.Policy, "ferramentas desta etapa", "Atalhos para as aplicações que esta fase autoriza.") {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            apps.forEach { app ->
                Button(
                    onClick = { openAllowedApp(context, app) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue, contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(app.icon(), contentDescription = null, modifier = Modifier.size(17.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(app.label, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

private fun openAllowedApp(context: Context, app: AllowedApp) {
    val explicitIntent = app.preferredPackage?.let { packageName ->
        app.preferredActivity?.let { activityName ->
            android.content.Intent().setComponent(android.content.ComponentName(packageName, "$packageName$activityName"))
        }
    }
    val launchIntent = explicitIntent?.takeIf { it.resolveActivity(context.packageManager) != null }
        ?: app.packageNames.firstNotNullOfOrNull(context.packageManager::getLaunchIntentForPackage)
    launchIntent?.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)?.let(context::startActivity)
}

private fun AllowedApp.icon(): ImageVector = when (label) {
    "Calculadora" -> Icons.Outlined.Calculate
    "Samsung Notes" -> Icons.Outlined.EditNote
    else -> Icons.Outlined.Language
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
    var hypothesis by remember { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · 01 / 04")
        Text(title, color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("Contextualizar o fenómeno e activar conhecimentos prévios.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.MenuBook, "ETAPA 01 · COMPREENDER", "Conteúdos no momento certo.") {
            Text("O que acontece quando um corpo acelera?", color = Navy, fontSize = 20.sp, lineHeight = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Um corpo acelera quando a sua velocidade varia ao longo do tempo — quando fica mais rápido ou mais lento.", color = Muted, fontSize = 15.sp, lineHeight = 21.sp)
            Spacer(Modifier.height(6.dp))
            Box(modifier = Modifier.fillMaxWidth().background(LightBlue, RoundedCornerShape(18.dp)).padding(16.dp)) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Pontos-chave", color = Navy, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                    Text("1   A aceleração é a variação da velocidade no tempo.", color = Muted, fontSize = 14.sp, lineHeight = 19.sp)
                    Text("2   Pode ser positiva ou negativa.", color = Muted, fontSize = 14.sp, lineHeight = 19.sp)
                    Text("3   A unidade SI é o metro por segundo quadrado (m/s²).", color = Muted, fontSize = 14.sp, lineHeight = 19.sp)
                }
            }
            OutlinedTextField(
                value = hypothesis,
                onValueChange = { hypothesis = it },
                label = { Text("Qual é a tua hipótese?") },
                placeholder = { Text("Escreve aqui a tua ideia…") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )
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
private fun AnalyseState(samples: List<Float>) {
    val average = if (samples.isEmpty()) 0f else samples.average().toFloat()
    val peak = samples.maxOrNull() ?: 0f
    val insight = if (samples.size < 4) "Move o dispositivo para recolher uma amostra suficiente." else "Movimento estável durante a maior parte da amostra."
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · 03 / 04")
        Text("Analisar", color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("Os teus dados tornam-se evidência.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.Insights, "analisar", "Leitura local da amostra recolhida.") {
            Text("Padrão de movimento", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(insight, color = Muted, fontSize = 15.sp, lineHeight = 21.sp)
            Spacer(Modifier.height(14.dp))
            SensorChart(samples)
            Spacer(Modifier.height(12.dp))
            Text(String.format(Locale.US, "Média %.2f m/s² · Pico %.2f m/s²", average, peak), color = PrimaryBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
        PhaseProgress(active = 2)
    }
}

@Composable
private fun ReflectState(capsuleId: String?, store: ReflectionStore) {
    var reflection by remember(capsuleId) { mutableStateOf(store.load(capsuleId)) }
    var saved by remember(capsuleId) { mutableStateOf(reflection.isNotBlank()) }
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("CAPSULE · 04 / 04")
        Text("Reflectir", color = Navy, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("Fecha a experiência com uma conclusão tua.", color = Muted, fontSize = 18.sp, lineHeight = 25.sp)
        BlueRule()
        FeatureCard(Icons.Outlined.EditNote, "exit ticket", "A resposta fica guardada apenas neste dispositivo para a aula.") {
            Text("O que concluis?", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(value = reflection, onValueChange = { reflection = it; saved = false }, placeholder = { Text("Escreve a tua conclusão…") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
            Spacer(Modifier.height(10.dp))
            Button(onClick = { store.save(capsuleId, reflection); saved = reflection.isNotBlank() }, enabled = reflection.isNotBlank(), colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue), shape = RoundedCornerShape(12.dp)) {
                Icon(Icons.Outlined.Check, contentDescription = null, modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(7.dp))
                Text(if (saved) "Conclusão guardada" else "Guardar conclusão", fontWeight = FontWeight.Bold)
            }
        }
        PhaseProgress(active = 3)
    }
}

@Composable
private fun BreakState(onFinish: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Eyebrow("AULA TERMINADA")
        Text("Intervalo", color = Navy, fontSize = 48.sp, lineHeight = 52.sp, fontWeight = FontWeight.Bold)
        Text("O telefone voltou a ser teu.", color = Muted, fontSize = 22.sp, lineHeight = 28.sp)
        Text("Aproveita este tempo para fazer o que te faz bem — conversa, relaxa, explora, move-te.", color = Muted, fontSize = 17.sp, lineHeight = 24.sp)
        Box(modifier = Modifier.fillMaxWidth().border(1.dp, BorderBlue, RoundedCornerShape(22.dp)).padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(modifier = Modifier.size(46.dp).background(LightBlue, CircleShape), contentAlignment = Alignment.Center) {
                    Icon(Icons.Outlined.CalendarMonth, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(25.dp))
                }
                Column {
                    Eyebrow("PRÓXIMA AULA")
                    Text("Matemática", color = Navy, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text("10:15 · Sala B3", color = Muted, fontSize = 15.sp)
                }
            }
        }
        Button(onClick = onFinish, colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue), shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth().height(58.dp)) {
            Icon(Icons.Outlined.Schedule, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
            Text("Guardar o telefone por 10 min", fontWeight = FontWeight.Bold)
        }
        TextButton(onClick = onFinish, modifier = Modifier.fillMaxWidth()) {
            Text("Usar normalmente", color = PrimaryBlue, fontWeight = FontWeight.Bold)
        }
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
