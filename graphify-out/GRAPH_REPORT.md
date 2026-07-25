# Graph Report - .  (2026-07-25)

## Corpus Check
- 166 files · ~79,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 886 nodes · 1338 edges · 108 communities (43 shown, 65 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Navigation Components
- 3D Trainer Visualization
- Dashboard UI Elements
- Linting & Code Quality
- Form UI Components
- React UI Components
- Route Definitions
- Authentication Middleware
- TypeScript Configuration
- Auth & Admin Functions
- Project Documentation
- WhatsApp Integration
- Coach & AI Logic
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 102
- Community 103
- Community 104

## God Nodes (most connected - your core abstractions)
1. `cn()` - 69 edges
2. `FileRoutesByPath` - 31 edges
3. `MobileFrame()` - 19 edges
4. `StatusBar()` - 19 edges
5. `compilerOptions` - 17 edges
6. `ScreenHeader()` - 16 edges
7. `BottomNav()` - 14 edges
8. `useAuth()` - 10 edges
9. `getMe` - 9 edges
10. `react` - 8 edges

## Surprising Connections (you probably didn't know these)
- `CalendarDayButton()` --references--> `react`  [EXTRACTED]
  src/components/ui/calendar.tsx → package.json
- `useCarousel()` --references--> `react`  [EXTRACTED]
  src/components/ui/carousel.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  src/components/ui/form.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json

## Import Cycles
- None detected.

## Communities (108 total, 65 thin omitted)

### Community 0 - "Navigation Components"
Cohesion: 0.07
Nodes (31): BottomNav(), items, spring, MobileFrame(), ScreenHeader(), spring, StatusBar(), trainers (+23 more)

### Community 1 - "3D Trainer Visualization"
Cohesion: 0.06
Nodes (34): cameraPresets, Props, cameraPresets, Props, GLBTrainerViewer, Props, Trainer3DViewer, TrainerCoach() (+26 more)

### Community 2 - "Dashboard UI Elements"
Cohesion: 0.08
Nodes (29): ActivityRings(), Ring, DashboardHeader(), MetricCard(), StepsProgressCard(), dashboard, Exercise, Trainer (+21 more)

### Community 3 - "Linting & Code Quality"
Cohesion: 0.04
Nodes (46): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @lovable.dev/vite-tanstack-config (+38 more)

### Community 4 - "Form UI Components"
Cohesion: 0.05
Nodes (38): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 5 - "React UI Components"
Cohesion: 0.05
Nodes (36): react, react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem (+28 more)

### Community 6 - "Route Definitions"
Cohesion: 0.06
Nodes (35): AdminRoute, ApiCoachTtsRoute, ApiLiveCoachRoute, ApiPublicWhatsappWebhookRoute, ApiTtsRoute, AuthRoute, BrowseRoute, CoachIndexRoute (+27 more)

### Community 7 - "Authentication Middleware"
Cohesion: 0.09
Nodes (23): createSupabaseFetch(), isNewSupabaseApiKey(), requireSupabaseAuth, createSupabaseAdminClient(), createSupabaseFetch(), isNewSupabaseApiKey(), supabaseAdmin, CompositeTypes (+15 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, ES2022, eslint.config.js, ./src/*, src/**/*.ts, src/**/*.tsx, vite/client (+20 more)

### Community 9 - "Auth & Admin Functions"
Cohesion: 0.11
Nodes (14): adminBroadcast, adminListUsers, adminSendMessage, confirmWhatsappVerification, requestWhatsappVerification, getWhatsappStatus, listWhatsappMessages, listWhatsappSessions (+6 more)

### Community 10 - "Project Documentation"
Cohesion: 0.10
Nodes (13): SplashGate(), EASE, SplashScreen(), SplashScreenProps, LovableErrorOptions, LovableEvents, reportLovableError(), Window (+5 more)

### Community 11 - "WhatsApp Integration"
Cohesion: 0.13
Nodes (18): EvolutionEnv, EvolutionError, evolutionFetch(), sleep(), aguaMsg(), bar(), botReply(), fetchContexto() (+10 more)

### Community 12 - "Coach & AI Logic"
Cohesion: 0.09
Nodes (13): Checkbox, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, PopoverContent, Progress (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (13): attachSupabaseAuth, consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage(), fetch() (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (14): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (15): class-variance-authority, framer-motion, dependencies, class-variance-authority, framer-motion, @radix-ui/react-alert-dialog, @radix-ui/react-avatar, @radix-ui/react-context-menu (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (11): Route, Route, Route, Route, Route, Route, Route, Route (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (11): Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLinkProps, PaginationNext(), PaginationPrevious(), ResizableHandle() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 28 - "Community 28"
Cohesion: 0.32
Nodes (5): extractText(), handleEvent(), mapStatus(), Route, SupabaseAdmin

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 31 - "Community 31"
Cohesion: 0.40
Nodes (3): createLovableAiGatewayProvider(), Body, Route

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 33 - "Community 33"
Cohesion: 0.40
Nodes (4): getRouter(), Register, routeTree, startInstance

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): File-based Routing, Routing Architecture Docs, TanStack Start Framework

## Knowledge Gaps
- **406 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+401 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 18` to `Linting & Code Quality`, `React UI Components`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 54`, `Community 56`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 96`, `Community 97`, `Community 98`, `Community 99`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 20` to `Form UI Components`, `React UI Components`, `Coach & AI Logic`, `Community 15`, `Community 16`, `Community 17`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 32`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 41`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `react` connect `React UI Components` to `Community 18`, `Form UI Components`, `Community 15`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _406 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Navigation Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `3D Trainer Visualization` be split into smaller, more focused modules?**
  _Cohesion score 0.05660377358490566 - nodes in this community are weakly interconnected._
- **Should `Dashboard UI Elements` be split into smaller, more focused modules?**
  _Cohesion score 0.07890070921985816 - nodes in this community are weakly interconnected._