# 技術研究摘要

| 來源 | 重點 | 對架構嘅含意 |
|---|---|---|
| [Unity Manual：Use Unity as a Library in other applications](https://docs.unity3d.com/Manual/UnityasaLibrary.html) | Unity 可以作為 library 嵌入原生手機應用，負責即時 3D／2D 渲染同模型互動。一般方案只支援全螢幕渲染、只可載入一個 Unity runtime；unload 後仍可能保留約 80–180 MB 記憶體。 | React Native／原生外殼同 Unity 之間應以全螢幕 scene 邊界切換，唔應假設可將 Unity 任意嵌入細小卡片；需要記憶體預算、低階裝置測試同明確 lifecycle 管理。 |
| [Unity Manual：Unity as a Library—Android](https://docs.unity3d.com/Manual/UnityasaLibrary-Android.html) | Android 以 `unityLibrary` module 整合；第三方 plug-in 或 Gradle manifest 改動可能要適配。Unity unload 會卸載 scene，但保留 runtime 部分狀態；亦只支援單一 instance 及全螢幕。 | Android build pipeline 要將 Unity export 視為可重建產物，設自動整合腳本；所有 plugin 要做相容性清單同版本鎖定。 |
| [Unity Manual：Unity as a Library—iOS](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html) | iOS 以 `UnityFramework.framework` 整合；一般方案只支援全螢幕。Unity 完全 quit 後，同一個 app process 入面唔可以再重新啟動；Swift Xcode project type 對 Unity as a Library 有限制。 | iOS 應使用 unload／pause 而唔係完全 quit，並以 Objective-C／Objective-C++ bridge 包裝 React Native 或 Swift 介面；build 設定要列作高風險整合點。 |
| [React Native：Native Platform](https://reactnative.dev/docs/native-platform) | React Native 提供 Native Modules 同 Native Components，容許 JavaScript／TypeScript 呼叫 Swift、Objective-C、Java、Kotlin 或 C++ 平台能力；新版架構使用 Turbo Native Modules／Fabric。 | 可由 React Native 管理一般產品介面，再以受控 native bridge 呼叫 Unity runtime、下載管理、音訊同 lifecycle；bridge contract 要版本化同自動測試。 |
