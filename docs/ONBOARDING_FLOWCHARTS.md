# 🗺️ Onboarding Flowcharts - Visual Guide

**Projekt:** Sparkfined PWA  
**Version:** 2.0  
**Datum:** 2025-11-04

---

## 📋 Übersicht

Dieser Dokument enthält Mermaid-Flowcharts für alle Onboarding-Flows.

---

## 🎯 Flow 1: First-Time User Journey (Complete)

```mermaid
graph TD
    Start([User öffnet App]) --> CheckFirstVisit{Erster Besuch?}
    
    CheckFirstVisit -->|Ja| WelcomeOverlay[Welcome Overlay zeigen<br/>2s Delay]
    CheckFirstVisit -->|Nein| DirectAnalyze[Direkt zu AnalyzePage]
    
    WelcomeOverlay --> UserChoice{User Wahl}
    UserChoice -->|Try Demo| DemoFlow[Demo-Flow starten]
    UserChoice -->|Skip Tour| FreeExplore[Freie Exploration]
    
    DemoFlow --> FillSOL[SOL Address einfüllen]
    FillSOL --> HighlightButton[Analyze Button highlighten]
    HighlightButton --> AutoClick[Auto-Click nach 1s]
    AutoClick --> Loading[Loading State 5-10s]
    Loading --> ShowResults[Results mit Animation]
    ShowResults --> Tooltip1[Tooltip: KPI Cards]
    Tooltip1 --> Tooltip2[Tooltip: Heatmap]
    Tooltip2 --> Tooltip3[Tooltip: AI Button]
    Tooltip3 --> FirstValue[✅ First Value Moment]
    
    FreeExplore --> DirectAnalyze
    DirectAnalyze --> UserAnalyze{User gibt<br/>Token ein?}
    
    UserAnalyze -->|Ja| ManualAnalyze[Manuelle Analyse]
    UserAnalyze -->|Nein| WaitHint[20s warten]
    
    ManualAnalyze --> FirstValue
    WaitHint --> ShowHint[Toast: 'Try analyzing a token']
    ShowHint --> UserAnalyze
    
    FirstValue --> TrackFirst[Track firstAnalyzeTimestamp]
    TrackFirst --> FeatureDiscovery[Feature Discovery Phase]
    
    FeatureDiscovery --> Wait20s[20s aktiv]
    Wait20s --> Hint1[Hint: Save to Journal]
    Hint1 --> Wait30s[30s aktiv]
    Wait30s --> Hint2[Hint: View Chart]
    Hint2 --> Wait60s[60s aktiv]
    Wait60s --> Hint3[Hint: Create Alert]
    
    Hint3 --> Wait180s{3+ Min aktiv?}
    Wait180s -->|Ja| PWAPrompt[PWA Install Prompt]
    Wait180s -->|Nein| Continue[Weiter nutzen]
    
    PWAPrompt --> UserPWA{User Wahl}
    UserPWA -->|Install| PWAInstalled[✅ PWA Installiert]
    UserPWA -->|Dismiss| PWADismissed[Re-prompt in 24h]
    
    PWAInstalled --> Success[🎉 Onboarding Complete]
    PWADismissed --> Success
    Continue --> Success
```

---

## 🔄 Flow 2: Demo Analysis (Detailed)

```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant State
    
    User->>App: Klickt "Try Demo"
    App->>State: Set demoStarted = true
    App->>App: Fade out Welcome Overlay
    
    Note over App: Animation (300ms)
    
    App->>App: Fill input with SOL address
    App->>App: Highlight "Analyze" button
    App->>App: Add pulse animation
    
    alt User klickt Analyze
        User->>App: Klickt "Analyze"
    else Auto-click nach 1s
        App->>App: Auto-click Analyze
    end
    
    App->>State: Set loading = true
    App->>API: fetchOhlc(SOL, 15m)
    
    Note over API: 5-10 Sekunden
    
    API-->>App: OHLC Data + KPIs
    App->>State: Set data + loading = false
    
    App->>App: Animate results in
    
    Note over App: Show KPI Cards
    
    App->>User: Show Tooltip #1: "Key metrics"
    User->>App: Klickt "Got it"
    
    Note over App: Show Heatmap
    
    App->>User: Show Tooltip #2: "Indicator signals"
    User->>App: Klickt "Got it"
    
    Note over App: Show AI Section
    
    App->>User: Show Tooltip #3: "AI insights"
    User->>App: Klickt "Got it"
    
    App->>State: Set demoCompleted = true
    App->>State: Set firstAnalyzeTimestamp = now()
    
    Note over User,State: ✅ First Value Moment Achieved!
```

---

## 🎫 Flow 3: Access System Discovery

```mermaid
graph TD
    Start([User in App]) --> Wait120s{2 Min aktiv?}
    
    Wait120s -->|Ja| ShowToast[Toast: 'Unlock full features']
    Wait120s -->|Nein| Continue[Weiter nutzen]
    
    ShowToast --> UserToast{User Aktion}
    UserToast -->|Learn More| OpenAccess[Access Page öffnen]
    UserToast -->|Not Now| DismissToast[Toast dismiss]
    
    DismissToast --> ShowBadge[Badge in Header]
    ShowBadge --> UserBadge{User klickt Badge?}
    
    UserBadge -->|Ja| OpenAccess
    UserBadge -->|Nein| PersistBadge[Badge bleibt sichtbar]
    
    OpenAccess --> CheckFirst{Erster Besuch<br/>Access Page?}
    
    CheckFirst -->|Ja| ShowExplainer[Access Explainer Modal]
    CheckFirst -->|Nein| DirectToStatus[Direct to Status Tab]
    
    ShowExplainer --> ExplainerContent[OG Pass vs Holder<br/>Side-by-side]
    ExplainerContent --> UserChoice{User Wahl}
    
    UserChoice -->|Calculate Lock| SwitchToLock[Switch to Lock Tab]
    UserChoice -->|Check Balance| SwitchToHold[Switch to Hold Tab]
    UserChoice -->|Maybe Later| CloseExplainer[Modal schließen]
    
    SwitchToLock --> LockCalculator[Lock Calculator öffnen]
    LockCalculator --> EnterMCAP[MCAP eingeben]
    EnterMCAP --> ChooseRank[Rank wählen 1-333]
    ChooseRank --> ShowRequired[Required tokens anzeigen]
    ShowRequired --> UserLock{Weiter?}
    
    UserLock -->|Lock & Mint| ConnectWallet[Wallet Connect]
    UserLock -->|Not Yet| SaveCalc[Calculation speichern]
    
    ConnectWallet --> CheckBalance{Balance OK?}
    CheckBalance -->|Ja| InitiateLock[Streamflow Lock initiieren]
    CheckBalance -->|Nein| ShowError[Nicht genug Tokens]
    
    InitiateLock --> MintNFT[NFT minten]
    MintNFT --> Success[🎉 OG Pass erhalten!]
    
    SwitchToHold --> HoldCheck[Hold Check öffnen]
    HoldCheck --> ConnectWallet2[Wallet Connect]
    ConnectWallet2 --> CheckTokens{≥100k Tokens?}
    
    CheckTokens -->|Ja| HolderAccess[✅ Holder Access granted]
    CheckTokens -->|Nein| ShowRequirement[Zeige Requirement]
    
    Continue --> End([Onboarding continues])
    CloseExplainer --> DirectToStatus
    SaveCalc --> End
    ShowError --> End
    HolderAccess --> End
    ShowRequirement --> End
    Success --> End
```

---

## 📲 Flow 4: PWA Installation Flow

```mermaid
graph TD
    Start([App läuft]) --> TrackUsage[Track User Activity]
    
    TrackUsage --> CheckConditions{PWA Prompt<br/>Bedingungen?}
    
    CheckConditions -->|Nicht erfüllt| WaitMore[Weiter tracken]
    WaitMore --> TrackUsage
    
    CheckConditions -->|Erfüllt| CheckPrompted{Schon<br/>prompted?}
    
    CheckPrompted -->|Ja| NoShow[Nicht zeigen]
    CheckPrompted -->|Nein| CheckInstalled{Schon<br/>installiert?}
    
    CheckInstalled -->|Ja| NoShow
    CheckInstalled -->|Nein| ShowPrompt[PWA Install Prompt<br/>Bottom Right]
    
    ShowPrompt --> UserAction{User Aktion}
    
    UserAction -->|Install| NativePrompt[Native Browser Dialog]
    UserAction -->|Dismiss| MarkPrompted[Set pwaInstallPrompted = true]
    UserAction -->|Close X| MarkPrompted
    
    NativePrompt --> UserNative{Browser Aktion}
    
    UserNative -->|Accept| InstallSuccess[✅ PWA Installed]
    UserNative -->|Cancel| InstallCancelled[Installation abgebrochen]
    
    InstallSuccess --> SetInstalled[Set pwaInstalled = true]
    InstallSuccess --> Celebrate[🎉 Erfolgs-Animation]
    InstallSuccess --> TrackEvent[Track: pwa_installed]
    
    InstallCancelled --> MarkPrompted
    MarkPrompted --> Schedule[Schedule Re-prompt in 24h]
    
    Schedule --> Wait24h[24 Stunden warten]
    Wait24h --> ResetPrompted[Reset pwaInstallPrompted]
    ResetPrompted --> TrackUsage
    
    SetInstalled --> End([PWA Flow Complete])
    TrackEvent --> End
    NoShow --> End
    
    style InstallSuccess fill:#90EE90
    style Celebrate fill:#FFD700
    style NoShow fill:#FFB6C1
```

---

## 📝 Flow 5: Journal Integration Flow

```mermaid
graph TD
    Start([User auf Analyze Page]) --> AnalyzeComplete{Analyse<br/>abgeschlossen?}
    
    AnalyzeComplete -->|Nein| Wait[Warten]
    AnalyzeComplete -->|Ja| CheckAI{AI Result<br/>vorhanden?}
    
    CheckAI -->|Ja| HighlightJournal[Button 'In Journal einfügen'<br/>highlighten]
    CheckAI -->|Nein| ShowAIHint[Hint: 'Generate AI insights']
    
    HighlightJournal --> ShowTooltip[Tooltip: 'Save for later review']
    ShowTooltip --> UserJournal{User klickt<br/>Journal Button?}
    
    UserJournal -->|Ja| BroadcastEvent[Event: journal:insert]
    UserJournal -->|Nein| CountAnalyzes[Increment analyzeCount]
    
    BroadcastEvent --> CopyClipboard[Copy to clipboard]
    CopyClipboard --> ShowAlert[Alert: 'Sent to Journal']
    ShowAlert --> UserGoesJournal{User öffnet<br/>Journal?}
    
    UserGoesJournal -->|Ja| JournalPage[Navigate to Journal]
    UserGoesJournal -->|Nein| RemindLater[Remind later]
    
    CountAnalyzes --> CheckCount{analyzeCount ≥ 3?}
    
    CheckCount -->|Nein| Wait
    CheckCount -->|Ja| CheckJournalUsed{Journal<br/>schon genutzt?}
    
    CheckJournalUsed -->|Ja| NoRemind[Kein Reminder]
    CheckJournalUsed -->|Nein| ShowJournalToast[Toast: 'Start a trade journal']
    
    ShowJournalToast --> UserToast{User Aktion}
    
    UserToast -->|Open Journal| JournalPage
    UserToast -->|Later| DismissToast[Toast dismiss]
    
    JournalPage --> ShowJournalEmpty{Journal<br/>leer?}
    
    ShowJournalEmpty -->|Ja| EmptyState[Empty State mit CTA]
    ShowJournalEmpty -->|Nein| ShowEntries[Entries anzeigen]
    
    EmptyState --> CreateFirst[Button: 'Create First Entry']
    CreateFirst --> Editor[Journal Editor öffnen]
    
    ShowEntries --> PendingInsert{Pending insert<br/>from Analyze?}
    
    PendingInsert -->|Ja| ShowAppendButton[Button: 'Append AI to note']
    PendingInsert -->|Nein| NormalView[Normal Journal View]
    
    ShowAppendButton --> UserAppend{User klickt<br/>Append?}
    
    UserAppend -->|Ja| AppendToNote[AI text zu Note hinzufügen]
    UserAppend -->|Nein| DiscardPending[Pending verwerfen]
    
    AppendToNote --> SaveNote[Note speichern]
    SaveNote --> Success[✅ Journal Entry created]
    
    Editor --> Success
    RemindLater --> End([Continue using app])
    DismissToast --> End
    NoRemind --> End
    NormalView --> End
    DiscardPending --> End
    Success --> End
    
    style Success fill:#90EE90
```

---

## 🔔 Flow 6: Push Notification Opt-In

```mermaid
graph TD
    Start([User öffnet App]) --> TrackActions[Track User Actions]
    
    TrackActions --> CheckEngaged{Engaged User?<br/>2+ Sessions}
    
    CheckEngaged -->|Nein| WaitMore[Weiter tracken]
    CheckEngaged -->|Ja| CheckAlreadyAsked{Push schon<br/>gefragt?}
    
    CheckAlreadyAsked -->|Ja| NoPrompt[Nicht promoten]
    CheckAlreadyAsked -->|Nein| ShowBadge[Badge auf Notifications Icon]
    
    ShowBadge --> UserOpensNotif{User öffnet<br/>Notifications?}
    
    UserOpensNotif -->|Nein| PersistBadge[Badge bleibt]
    UserOpensNotif -->|Ja| NotificationsPage[Navigate to Page]
    
    NotificationsPage --> ShowPriming[Permission Priming UI]
    
    ShowPriming --> PrimingContent[Zeige Benefits:<br/>• Price alerts<br/>• Volume spikes<br/>• Patterns]
    
    PrimingContent --> UserPriming{User Aktion}
    
    UserPriming -->|Enable Notifications| SetAsked[Set pushPermissionAsked = true]
    UserPriming -->|Maybe Later| DismissPriming[Priming dismiss]
    
    SetAsked --> RequestPermission[Browser Permission Request]
    
    RequestPermission --> BrowserDialog[Native Permission Dialog]
    
    BrowserDialog --> UserBrowser{User Entscheidung}
    
    UserBrowser -->|Allow| PermissionGranted[✅ Permission Granted]
    UserBrowser -->|Block| PermissionDenied[❌ Permission Denied]
    
    PermissionGranted --> SetGranted[Set pushPermissionGranted = true]
    SetGranted --> RegisterSW[Service Worker registrieren]
    RegisterSW --> Subscribe[Push Subscription erstellen]
    Subscribe --> SendToServer[Subscription zu Server senden]
    SendToServer --> Success[🎉 Push Notifications active]
    
    Success --> ShowSuccess[Success UI:<br/>'Notifications Enabled!']
    ShowSuccess --> SuggestAlert[Suggest: 'Create First Alert']
    
    PermissionDenied --> SetDenied[Set pushPermissionGranted = false]
    SetDenied --> ShowFallback[Fallback UI:<br/>'Use Email Alerts instead']
    
    DismissPriming --> RemindLater[Remind in next session]
    
    SuggestAlert --> End([Notifications Flow Complete])
    ShowFallback --> End
    RemindLater --> End
    NoPrompt --> End
    WaitMore --> TrackActions
    PersistBadge --> TrackActions
    
    style Success fill:#90EE90
    style PermissionDenied fill:#FFB6C1
```

---

## 🎯 Flow 7: Feature Discovery (Bottom Nav)

```mermaid
graph TD
    Start([User in App]) --> InitState[Load visitedPages from localStorage]
    
    InitState --> RenderNav[Render Bottom Nav]
    
    RenderNav --> CheckBadges{Für jede Page:<br/>Schon besucht?}
    
    CheckBadges -->|Nein| ShowBadge[Red Dot Badge anzeigen]
    CheckBadges -->|Ja| NoBadge[Kein Badge]
    
    ShowBadge --> WaitClick[Warten auf User]
    NoBadge --> WaitClick
    
    WaitClick --> UserClick{User klickt<br/>Page Tab?}
    
    UserClick -->|Analyze| VisitAnalyze[Navigate to Analyze]
    UserClick -->|Journal| VisitJournal[Navigate to Journal]
    UserClick -->|Replay| VisitReplay[Navigate to Replay]
    
    VisitAnalyze --> MarkVisited1[Mark 'analyze' as visited]
    VisitJournal --> MarkVisited2[Mark 'journal' as visited]
    VisitReplay --> MarkVisited3[Mark 'replay' as visited]
    
    MarkVisited1 --> UpdateState[Update localStorage]
    MarkVisited2 --> UpdateState
    MarkVisited3 --> UpdateState
    
    UpdateState --> RemoveBadge[Remove Badge from Tab]
    RemoveBadge --> TrackEvent[Track: page_discovered]
    
    TrackEvent --> CheckAllVisited{Alle Pages<br/>besucht?}
    
    CheckAllVisited -->|Ja| ShowCongrats[Toast: '🎉 You discovered all features!']
    CheckAllVisited -->|Nein| RerenderNav[Bottom Nav re-render]
    
    ShowCongrats --> Achievement[Achievement unlocked:<br/>'Explorer']
    
    Achievement --> End([Feature Discovery Complete])
    RerenderNav --> WaitClick
    
    style ShowCongrats fill:#90EE90
    style Achievement fill:#FFD700
```

---

## 📊 Flow 8: Analytics Tracking

```mermaid
graph TD
    Start([User Event]) --> Identify{Event Type?}
    
    Identify -->|Onboarding| OnboardingEvents
    Identify -->|Feature| FeatureEvents
    Identify -->|Conversion| ConversionEvents
    Identify -->|Error| ErrorEvents
    
    OnboardingEvents --> OE1[onboarding_tour_shown]
    OnboardingEvents --> OE2[onboarding_tour_completed]
    OnboardingEvents --> OE3[onboarding_tour_skipped]
    
    FeatureEvents --> FE1[first_analyze]
    FeatureEvents --> FE2[ai_button_clicked]
    FeatureEvents --> FE3[chart_opened]
    
    ConversionEvents --> CE1[pwa_install_prompted]
    ConversionEvents --> CE2[pwa_install_accepted]
    ConversionEvents --> CE3[wallet_connected]
    
    ErrorEvents --> ER1[analyze_failed]
    ErrorEvents --> ER2[api_error]
    
    OE1 --> SendToAnalytics[Send to Analytics]
    OE2 --> SendToAnalytics
    OE3 --> SendToAnalytics
    FE1 --> SendToAnalytics
    FE2 --> SendToAnalytics
    FE3 --> SendToAnalytics
    CE1 --> SendToAnalytics
    CE2 --> SendToAnalytics
    CE3 --> SendToAnalytics
    ER1 --> SendToAnalytics
    ER2 --> SendToAnalytics
    
    SendToAnalytics --> CheckProvider{Analytics<br/>Provider?}
    
    CheckProvider -->|Plausible| SendPlausible[plausible.trackEvent]
    CheckProvider -->|Custom| SendCustom[POST /api/telemetry]
    CheckProvider -->|None| LogConsole[console.log]
    
    SendPlausible --> Success[✅ Event tracked]
    SendCustom --> Success
    LogConsole --> Success
    
    Success --> UpdateFunnel[Update Funnel Data]
    UpdateFunnel --> End([Tracking Complete])
```

---

## 🔄 Flow 9: Onboarding State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NotStarted: App opens
    
    NotStarted --> WelcomeShown: Show Welcome Overlay
    WelcomeShown --> DemoActive: User clicks 'Try Demo'
    WelcomeShown --> FreeExplore: User clicks 'Skip Tour'
    
    DemoActive --> FirstAnalyze: Demo completes
    FreeExplore --> FirstAnalyze: User analyzes token
    
    FirstAnalyze --> FeatureDiscovery: Track timestamp
    
    FeatureDiscovery --> FeatureUsage: User explores features
    FeatureUsage --> FeatureDiscovery: More actions
    
    FeatureDiscovery --> PWAPromptReady: 3+ min active
    PWAPromptReady --> PWAPromptShown: Show prompt
    
    PWAPromptShown --> PWAInstalled: User installs
    PWAPromptShown --> PWADismissed: User dismisses
    
    PWADismissed --> PWAPromptReady: After 24h
    
    FeatureDiscovery --> AccessDiscovery: User opens Access
    AccessDiscovery --> AccessExplainerShown: Show explainer
    
    AccessExplainerShown --> WalletConnecting: User connects wallet
    WalletConnecting --> WalletConnected: Connection success
    
    PWAInstalled --> OnboardingComplete
    WalletConnected --> OnboardingComplete
    FeatureUsage --> OnboardingComplete: After 3+ sessions
    
    OnboardingComplete --> [*]
    
    note right of FirstAnalyze
        Critical moment:
        firstAnalyzeTimestamp
    end note
    
    note right of OnboardingComplete
        User is now a
        power user!
    end note
```

---

## 🎬 Flow 10: Complete User Journey (High-Level)

```mermaid
journey
    title User Onboarding Journey - Sparkfined PWA
    
    section Discovery
      Opens App: 5: User
      Sees Welcome: 4: User
      Decides to try: 5: User
    
    section First Value
      Starts Demo: 5: User
      Sees Results: 5: User
      Understands Features: 4: User
    
    section Exploration
      Explores UI: 4: User
      Tries AI Button: 5: User
      Opens Chart: 4: User
      Saves to Journal: 3: User
    
    section Conversion
      Sees PWA Prompt: 3: User
      Reads Benefits: 4: User
      Installs App: 5: User
    
    section Engagement
      Returns next day: 5: User
      Creates Alert: 4: User
      Opens Access Page: 3: User
      Connects Wallet: 4: User
    
    section Retention
      Daily active usage: 5: User
      Shares with friends: 4: User
      Becomes power user: 5: User
```

---

## 📈 Funnel Visualization

```mermaid
graph TD
    subgraph "Onboarding Funnel"
    F1[App Opens<br/>1000 Users<br/>100%]
    F2[Welcome Shown<br/>950 Users<br/>95%]
    F3[Demo Started<br/>760 Users<br/>76%]
    F4[First Analyze<br/>684 Users<br/>68%]
    F5[Features Explored<br/>547 Users<br/>55%]
    F6[PWA Prompted<br/>438 Users<br/>44%]
    F7[PWA Installed<br/>219 Users<br/>22%]
    F8[D1 Return<br/>438 Users<br/>44%]
    F9[D7 Return<br/>263 Users<br/>26%]
    
    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> F5
    F5 --> F6
    F6 --> F7
    F4 --> F8
    F8 --> F9
    end
    
    style F1 fill:#90EE90
    style F4 fill:#FFD700
    style F7 fill:#87CEEB
    style F9 fill:#FFB6C1
```

---

## 🎯 Zusammenfassung

Diese Flowcharts zeigen:

1. ✅ **Complete User Journey** - Vom ersten Öffnen bis Power User
2. ✅ **Feature Discovery** - Wie User Features entdecken
3. ✅ **Conversion Flows** - PWA Install, Wallet Connect
4. ✅ **State Management** - Wie Onboarding-State sich entwickelt
5. ✅ **Analytics** - Was getrackt wird
6. ✅ **Funnel** - Wo User abspringen

**Nächste Schritte:**
- Feedback zu den Flows
- Anpassungen basierend auf Diskussion
- Implementation der Priority-Flows

---

**Fragen oder Feedback? Lass uns diskutieren! 💬**
