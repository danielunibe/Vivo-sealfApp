package com.davidsanchez.vivopromotor

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.ViewCompat
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        super.onCreate(savedInstanceState)
        actionBar?.hide()
        supportActionBar?.hide()
        configureImmersiveWindow()
        window.decorView.post {
            configureImmersiveWindow()
        }
        window.decorView.postDelayed({
            configureImmersiveWindow()
        }, 800)
    }

    override fun onResume() {
        super.onResume()
        window.decorView.post {
            configureImmersiveWindow()
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            window.decorView.post {
                configureImmersiveWindow()
            }
        }
    }

    private fun configureImmersiveWindow() {
        runCatching {
            WindowCompat.setDecorFitsSystemWindows(window, false)
            window.decorView.setBackgroundColor(Color.BLACK)
            window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING)
            window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
            window.addFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN or
                    WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                window.attributes = window.attributes.apply {
                    layoutInDisplayCutoutMode =
                        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
            }

            @Suppress("DEPRECATION")
            window.statusBarColor = Color.TRANSPARENT
            @Suppress("DEPRECATION")
            window.navigationBarColor = Color.TRANSPARENT

            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                window.isStatusBarContrastEnforced = false
                window.isNavigationBarContrastEnforced = false
            }

            WindowInsetsControllerCompat(window, window.decorView).apply {
                systemBarsBehavior =
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                hide(WindowInsetsCompat.Type.systemBars())
            }

            prepareRootContentInsets()
        }.onFailure { error ->
            Log.w(LOG_TAG, "Immersive window skipped on this device", error)
        }
    }

    private fun prepareRootContentInsets() {
        val content = findViewById<ViewGroup>(android.R.id.content) ?: return
        clearRootInsets(content)
        clearFirstChildInsets(content)
        ViewCompat.setOnApplyWindowInsetsListener(content) { view, _ ->
            clearRootInsets(view)
            if (view is ViewGroup) {
                clearFirstChildInsets(view)
            }
            WindowInsetsCompat.CONSUMED
        }
    }

    private fun clearFirstChildInsets(parent: ViewGroup) {
        if (parent.childCount > 0) {
            clearRootInsets(parent.getChildAt(0))
        }
    }

    private fun clearRootInsets(view: View) {
        view.fitsSystemWindows = false
        view.setPadding(0, 0, 0, 0)

        val params = view.layoutParams
        if (params is ViewGroup.MarginLayoutParams) {
            params.setMargins(0, 0, 0, 0)
            view.layoutParams = params
        }
    }

    private companion object {
        private const val LOG_TAG = "VivoPromotor"
    }
}
