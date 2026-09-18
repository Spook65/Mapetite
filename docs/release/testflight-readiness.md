# Mapetite TestFlight readiness

## Status

Mapetite is not yet packaged for iOS and this document does not add an iOS dependency or project. The recommended first beta path is a carefully finished Capacitor shell around the existing React/Vite product, followed by a SwiftUI decision only after beta usage demonstrates value that a web-based shell cannot deliver.

Before implementation, recheck current Apple documentation and App Review requirements. Apple can update SDK, Xcode, privacy, and submission requirements over time.

## 1. Distribution path options

### PWA or browser

**Strengths**

- Lowest engineering and maintenance cost.
- Existing Vercel and Render deployment stays the source of truth.
- Immediate updates without TestFlight review or build distribution.
- No native wrapper, signing, or App Store Connect setup.

**Limitations**

- This is not a TestFlight distribution path.
- Installation, background behavior, safe areas, link handling, and platform integration are more limited.
- It does not answer whether Mapetite is ready as an App Store product.

Use the PWA/browser deployment as the stable fallback throughout any iOS beta.

### Capacitor iOS wrapper

**Strengths**

- Reuses the React/Vite UI, API contracts, map, validation, and accessibility work.
- Creates an Xcode project that can be signed, archived, and uploaded to App Store Connect.
- Allows focused native integration later without an immediate rewrite.
- Best cost-to-learning ratio for an initial TestFlight cohort.

**Risks**

- App Review Guideline 4.2 expects more than a repackaged website. A thin WebView with broken web affordances or little platform value may be rejected.
- Safe areas, keyboard behavior, external links, launch state, network failures, permissions, and navigation need native-quality handling.
- Wrapper/plugin updates add a second release surface.
- Remote web deployment and bundled web assets have different review and failure tradeoffs; this choice must be deliberate.

### Native SwiftUI rewrite

**Strengths**

- Best access to native navigation, material, split views, accessibility, performance, and platform conventions.
- Clear long-term route if Mapetite develops deeply native workflows.

**Risks**

- Reimplements a stable product before beta demand is proven.
- Doubles feature parity, QA, and release work across web and iOS.
- MapLibre, auth, cache, API errors, saved state, and responsive behavior all need a new client implementation.

Treat SwiftUI as a traction-based investment, not the prerequisite for learning from beta users.

## 2. Recommended path

1. Keep the responsive web app as the canonical product.
2. Run an iOS web-readiness sprint: safe areas, keyboard, external navigation, offline/provider errors, touch targets, and privacy copy.
3. Add Capacitor in a separate approved implementation pass and isolated branch.
4. Bundle the reviewed web build in the app for predictable submission behavior unless the product explicitly chooses and documents a remote-content model.
5. Start with a small internal TestFlight group.
6. Move to a capped external group only after crash-free testing, backend limits, review metadata, and a privacy policy are ready.
7. Revisit SwiftUI after observing retention, native feature requests, and wrapper limitations.

The wrapper must feel like a durable restaurant discovery utility, not a website with an icon. Mapetite’s saved shortlist, adaptive list/map comparison, explicit location flow, robust place validation, and external directions provide a stronger value story, but they still need polished native-shell behavior.

## 3. Apple Developer and TestFlight requirements

### Account and signing

- Active Apple Developer Program membership.
- App Store Connect access for the Account Holder and any approved team roles.
- A unique bundle identifier selected before the first uploaded build; it must match the Xcode project and cannot be changed after upload.
- Distribution signing managed through Xcode/App Store Connect.
- Unique marketing version and build number for every upload.
- Current supported Xcode and SDK versions, rechecked immediately before archive/upload.

### App Store Connect record

- App name, primary language, SKU, bundle ID, category, and age rating responses.
- App icon and launch screen assets that do not use third-party trademarks.
- Support URL and support email.
- Privacy policy URL. Apple currently requires this for iOS apps.
- Accurate App Privacy answers covering Mapetite and every integrated third-party SDK/service.
- Export compliance answers for the selected build.
- Screenshots for required device classes. App Store Connect currently accepts one to ten screenshots per supported display class; verify current sizes before capture.

### TestFlight metadata and testing

- Beta app description.
- Feedback email.
- “What to Test” notes for each build.
- Beta App Review contact information and notes.
- A working demo account when review needs authenticated functionality, with no personal data and no expiring one-time setup.
- Clear explanation of backend cold starts and how a reviewer should retry, preferably after cold-start risk is reduced.
- Internal tester group before external testing.
- The first external build submitted to TestFlight App Review.

Apple currently supports up to 100 internal testers who are App Store Connect users and up to 10,000 external testers. Those are ceilings, not recommended launch sizes. Mapetite should begin much smaller.

References:

- [TestFlight overview](https://developer.apple.com/testflight/)
- [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers)
- [App information reference](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)
- [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 4. Public link strategy

Do not publish an unrestricted link on day one.

1. **Internal:** 5–15 known testers covering current and older supported iPhones plus at least one iPad.
2. **Closed external:** 25–50 testers invited by email after the first beta review.
3. **Capped public link:** 100–250 testers only after backend capacity and provider quotas are measured.
4. Apply device and OS criteria where useful.
5. Monitor public-link views, installs, crashes, feedback, backend request volume, and provider failures.
6. Disable the link when the chosen cap, budget threshold, or incident threshold is reached.

Never treat Apple’s 10,000 external-tester maximum as a safe infrastructure target.

## 5. App Review risks

| Risk | Why it matters | Mitigation before external beta |
| --- | --- | --- |
| Thin web wrapper | Guideline 4.2 requires lasting utility beyond a repackaged website | Native-quality shell, saved shortlist, adaptive split layout, reliable navigation, offline/error UX, and clear beta value |
| Broken links or web navigation | External pages can strand users or open inside the wrong context | Define allowlisted in-app origins; open Google Maps, OpenStreetMap, privacy, and support links in the appropriate system browser/app |
| Placeholder or prototype content | Reviewers may interpret mock data as a broken or misleading product | Ship only real provider-backed listings and existing honest fallbacks; exclude design-lab files from app navigation |
| Backend cold start/timeouts | A first review session can appear broken | Health warmup, bounded timeouts, retry UX, provider kill switch, and pre-review health check |
| Minimum lasting value | Search-only wrappers can appear interchangeable | Present validated global place search, honest list/map comparison, favorites, evidence, and resilient results as a cohesive utility |
| Location permission copy | Generic or premature prompts undermine trust and may fail review expectations | Request only from explicit Use My Location; add precise usage text; ensure core city search works without permission |
| Privacy mismatch | App privacy answers must include first- and third-party handling | Create a data inventory and align policy, App Store answers, runtime behavior, and server logs |
| Restaurant-data claims | Public listing data can be incomplete or stale | Keep “likely open,” approximate distance, provider limitations, and external-directions language |
| Third-party media rights | Hotlinked or unlicensed images create reliability and rights risk | Verify provider terms, preserve source attribution, filter insecure URLs, and use Mapetite fallback art on failure |
| Demo authentication | Memory-backed accounts can disappear on restart | Clearly label beta limitations or move to approved durable auth before broad external testing |
| App crash or blank WebView | Network/config mistakes can make the entire wrapper unusable | Bundle tested assets, add an offline shell, validate every release build on device, and provide recoverable error states |

## 6. Financial safeguards

### Beta policy

- Keep the beta free.
- Do not add subscriptions, in-app purchases, ads, or paid acquisition initially.
- Do not add a paid API without explicit approval, a documented budget, and hard usage controls.
- Keep Google Maps as an external URL launcher; do not add Google Routes billing.

### Infrastructure guardrails

| Guardrail | Initial beta approach |
| --- | --- |
| Tester count | 5–15 internal, then 25–50 closed external; public link capped at 100–250 |
| Backend spend | Set a monthly platform budget before external testing; alert at 50%, 75%, and 90% |
| Provider quota | Record contractual daily/monthly limits; alert before exhaustion; never silently switch to fabricated data |
| Search rate limits | Retain separate search and autocomplete limits; test CORS-preserving structured errors |
| Cache | Keep TTL/cache behavior documented; measure hit rate before funding persistent infrastructure |
| Kill switch | Plan a server-side environment flag that can disable provider search with honest maintenance JSON; do not implement until approved |
| Public link | Disable on incident, budget threshold, quota threshold, or tester cap |
| Monitoring | Aggregate request counts, latency, status groups, and provider errors without logging precise location coordinates |

The owner should write actual currency and request thresholds into a private release runbook before inviting external testers. This repository should not contain billing credentials or private account limits.

## 7. Security and privacy safeguards

### Required before beta

- No tracking or analytics SDK by default.
- No precise location request until the user explicitly chooses Use My Location.
- City search remains fully usable without location permission.
- A public privacy policy accurately describes typed searches, explicit location, account/saved behavior, local browser storage, server logs, providers, retention, and deletion/contact options.
- API and provider keys remain server-side and absent from bundled JavaScript and native configuration committed to source.
- CORS allowlists only approved production and test origins; do not use wildcard credentials.
- Keep rate limits on search, auth, and suggestions while leaving health checks usable.
- Remove or gate debug endpoints and performance logging in release builds.
- Use HTTPS only. Review iOS App Transport Security exceptions; avoid broad exceptions.
- Validate and encode all external URLs, including maps launchers and media.
- Audit Capacitor plugins individually. Add only plugins needed for the beta.
- Review iOS privacy manifest and required-reason API obligations for the final dependency graph.
- Store authentication material using an approved native-secure approach if the wrapper’s threat model requires it; do not assume browser localStorage is equivalent to Keychain.
- Never log precise user coordinates, authorization headers, passwords, or provider secrets.

### Data inventory to complete

| Data | Current purpose | Beta decision needed |
| --- | --- | --- |
| Typed city/region/country | Place validation and restaurant search | Retention and server-log policy |
| Explicit one-time coordinates | Use My Location search/map origin | Confirm memory-only lifecycle and no logging |
| Recent searches/last snapshot | Browser-local convenience | Document TTL, clear control, and device-local behavior |
| Demo account credentials | Authentication | Decide whether memory storage is acceptable for closed beta |
| Saved restaurant IDs/data | User shortlist | Retention, deletion, and restart behavior |
| Operational logs | Reliability and abuse prevention | Minimize fields and set retention |

## 8. Capacitor implementation boundaries

Adding Capacitor is intentionally outside this design-only task. When approved:

- Use a dedicated branch and record every dependency and plugin.
- Decide bundled assets versus remote deployment before implementation.
- Configure native navigation and external URL allowlists.
- Add safe-area CSS and test keyboard resize behavior.
- Add a launch screen and icons from owned assets.
- Handle offline, provider unavailable, auth expiry, and backend cold-start states without blank screens.
- Keep MapLibre attribution and validate WebGL performance on physical devices.
- Verify Google Maps URLs open externally with a filled destination.
- Never request location on app launch.
- Run dependency audit, static secret scan, release build inspection, and device testing before upload.

## 9. Pre-TestFlight checklist

### Product and UX

- [ ] Primary city search works from a clean install.
- [ ] Fake and ambiguous places fail with friendly, honest copy.
- [ ] Search, filters, sort, map, details, directions, save, account, and logout work.
- [ ] No production route exposes design-lab placeholders.
- [ ] iPhone safe areas and keyboard do not cover inputs or selected sheets.
- [ ] iPad split/full-screen states do not duplicate controls.
- [ ] No horizontal overflow at supported widths.
- [ ] Dynamic text scaling and VoiceOver reading order are usable.
- [ ] Reduced motion and increased contrast remain usable.
- [ ] Offline, provider timeout, rate-limit, and backend-unavailable states are recoverable.
- [ ] External maps, privacy, and support links open intentionally.

### Build and metadata

- [ ] Apple Developer Program membership is active.
- [ ] Bundle identifier is finalized.
- [ ] Signing, version, and build numbers are correct.
- [ ] Current Xcode/SDK submission requirements are met.
- [ ] Owned app icon and launch screen are complete.
- [ ] Required screenshots are captured from the release build.
- [ ] App name, subtitle, category, age rating, and support URL are accurate.
- [ ] Privacy policy URL is public and matches behavior.
- [ ] App Privacy responses include all services and dependencies.
- [ ] Export compliance questions are answered.
- [ ] Beta description, feedback email, What to Test, review notes, and contact are complete.
- [ ] A non-personal demo account is supplied if review needs authentication.

### Reliability, cost, and operations

- [ ] Release build passes check, build, test, and device smoke tests.
- [ ] No secret, debug endpoint, verbose performance log, or source map leakage is unintended.
- [ ] Backend health, cold start, timeout, and provider failure behavior are verified.
- [ ] Provider and hosting quotas are documented.
- [ ] Monthly budget and alert thresholds are configured.
- [ ] Search/autocomplete/auth rate limits are verified.
- [ ] Incident owner and rollback process are documented.
- [ ] Provider-search kill-switch design is approved and tested if implemented.
- [ ] Initial tester cap and public-link disable criteria are recorded.
- [ ] Crash and TestFlight feedback review cadence is assigned.

## 10. Release gate recommendation

Mapetite is a reasonable candidate for a **small internal Capacitor proof build**, not yet for an unrestricted public TestFlight link. The go/no-go gate for external testing should require:

1. durable or explicitly acceptable beta authentication/storage behavior,
2. safe-area and keyboard verification on physical iPhone and iPad hardware,
3. a public privacy policy and accurate App Privacy inventory,
4. owned icon/screenshots and complete review metadata,
5. backend/provider budget alerts and a documented incident cutoff,
6. recoverable cold-start, timeout, and offline states, and
7. evidence that the wrapper provides durable app-like utility under Guideline 4.2.

The first implementation milestone should be an internal-only Capacitor spike with no new native permission and no public distribution. Review that build’s interaction quality and cost profile before committing to broader TestFlight work or a SwiftUI rewrite.
