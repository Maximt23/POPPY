@echo off
:: 🐶 POPPY - Production Version (no creator dashboard)
set POPPY_MODE=production
node "%~dp0admin.js" %*
