package com.morph.runtime

import android.graphics.Color as AndroidColor
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.morph.runtime.domain.PhaseType

class ShieldActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = AndroidColor.WHITE
        window.navigationBarColor = AndroidColor.WHITE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        val phase = intent.getStringExtra(PHASE_TYPE)?.let { runCatching { PhaseType.valueOf(it) }.getOrNull() }
        val allowedTools = intent.getStringExtra(ALLOWED_TOOLS) ?: "apenas Morph"
        setContent { ShieldScreen(phase, allowedTools, onReturnToLesson = ::returnToLesson) }
    }

    private fun returnToLesson() {
        startActivity(Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        })
        finish()
    }

    companion object {
        const val PACKAGE_NAME = "packageName"
        const val PHASE_TYPE = "phaseType"
        const val ALLOWED_TOOLS = "allowedTools"
    }
}

@Composable
private fun ShieldScreen(phase: PhaseType?, allowedTools: String, onReturnToLesson: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(Paper).padding(horizontal = 28.dp, vertical = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Image(
            painter = painterResource(id = R.drawable.morph_logo),
            contentDescription = "Morph",
            modifier = Modifier.align(Alignment.Start).width(154.dp).height(58.dp)
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("MORPH SHIELD", color = PrimaryBlue, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
            Box(modifier = Modifier.size(64.dp).background(LightBlue, CircleShape), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.Eco, contentDescription = null, tint = Green, modifier = Modifier.size(34.dp))
            }
            Text("Vamos de volta\nà aula?", color = Navy, fontSize = 32.sp, lineHeight = 34.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Text("Esta aplicação não faz parte da etapa actual.\nDisponível agora: $allowedTools.", color = Muted, fontSize = 16.sp, lineHeight = 23.sp, textAlign = TextAlign.Center)
            Text("ETAPA ACTUAL · ${phase?.name ?: "AULA"}", color = PrimaryBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
            Spacer(Modifier.height(6.dp))
            Button(
                onClick = onReturnToLesson,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue, contentColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.width(250.dp).height(52.dp)
            ) {
                Text("Continuar a aprender", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }
        Text("MORPH · AULAS QUE TRANSFORMAM", color = Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    }
}

private val Paper = Color(0xFFFFFFFF)
private val Navy = Color(0xFF14254D)
private val PrimaryBlue = Color(0xFF1F6BFF)
private val LightBlue = Color(0xFFEAF3FF)
private val Green = Color(0xFF2EBB80)
private val Muted = Color(0xFF627493)
