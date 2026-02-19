# Android Build Troubleshooting Guide

## Fix for `app:compileDebugKotlin` Error

If you're experiencing the `app:compileDebugKotlin` error, follow these steps:

### Step 1: Clean All Build Artifacts
```bash
# From project root
npm cache clean --force

# Clean node_modules
rm -r node_modules
npm install

# Clean Android build
cd android
./gradlew.bat clean
cd ..
```

### Step 2: Stop Metro Bundler
Kill any existing Metro bundler processes and clear the cache:
```bash
# Windows PowerShell
Get-Process -Name "node" | Stop-Process -Force

# Alternative on Windows Command Prompt
taskkill /F /IM node.exe
```

### Step 3: Update Gradle
```bash
cd android
./gradlew.bat --version
cd ..
```

### Step 4: Rebuild Android App
```bash
# Option A: Use React Native CLI
npx react-native run-android

# Option B: Use Gradle directly
cd android
./gradlew.bat assembleDebug
cd ..
```

### Step 5: If Still Failing - Check Dependencies
Ensure you have all required packages:
```bash
npm list react-native
npm list @react-native/codegen
```

### Common Causes & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE: address already in use :::8081` | Metro port in use | Kill node processes & retry |
| `app:compileDebugKotlin` | Kotlin cache issue | Run `./gradlew.bat clean` |
| `Could not find com.facebook.react:react-native` | Dependencies mismatch | Delete node_modules & npm install |
| `Gradle sync failed` | Gradle version mismatch | Run `./gradlew.bat --refresh-dependencies` |

### Step-by-Step Complete Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
# 1. Stop all processes
Get-Process -Name "node" | Stop-Process -Force

# 2. Clean everything
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 3. Clean Android
cd android
./gradlew.bat clean
./gradlew.bat --stop
cd ..

# 4. Reinstall
npm install

# 5. Rebuild
npx react-native run-android
```

### Verify Installation
Before building, verify:
```bash
# Check Node version (needs 16+)
node --version

# Check npm version (needs 7+)
npm npm --version

# Check Android SDK
echo %ANDROID_HOME%
```

### Build With Debug Output
For more detailed error info:
```bash
cd android
./gradlew.bat assembleDebug --stacktrace --info
cd ..
```

### Important Files for Kotlin Compilation
- `android/build.gradle` - Kotlin version defined here
- `android/app/build.gradle` - App-level build config
- `android/gradle/wrapper/gradle-wrapper.properties` - Gradle version

Your current setup:
- Kotlin: 2.1.20 ✅
- Build Tools: 36.0.0 ✅
- Compile SDK: 36 ✅
- Gradle: 9.0.0 ✅

All versions are compatible!

---

## Next Steps

1. Try **Step 1-4** above
2. Check the error message in Android Studio console
3. Post the exact error if still failing

**Don't use TypeScript if you keep getting errors** - stick with `.js` files for now.
