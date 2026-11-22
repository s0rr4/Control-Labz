# Mobile — Control de Laboratorios UTR

Aplicación React Native con Expo que consume exactamente la misma API REST que la versión web.

## Instalación

```bash
cd mobile
npm install
copy .env.example .env
npx expo start
```

Para un emulador Android, `10.0.2.2` representa el localhost del equipo. En un dispositivo físico utiliza la IP LAN del equipo.

## APK local

```bash
npx expo prebuild --platform android
cd android
gradlew.bat assembleRelease
```
