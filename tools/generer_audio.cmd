@echo off
rem Akademya Tagalog : generation des voix naturelles (Gemini TTS)
rem Double-clic pour tout generer, ou en ligne de commande : tools\generer_audio.cmd --test
chcp 65001 >nul
cd /d "%~dp0.."
where py >nul 2>nul
if errorlevel 1 (
  echo Python est introuvable. Installe-le avec :  winget install Python.Python.3.12
  echo puis ferme et rouvre cette fenetre.
  pause
  exit /b 1
)
py -c "import lameenc" 2>nul || py -m pip install --user --disable-pip-version-check lameenc
py tools\generer_audio.py %*
echo.
pause
