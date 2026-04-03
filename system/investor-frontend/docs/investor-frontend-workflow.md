# Investor Frontend Workflow

This diagram reflects the route flow implemented in `src/App.js`, the onboarding pages under `src/pages/onboarding`, and the assistant handoff in `src/pages/AssistantRegister.jsx`.

For the assistant-only flow, see `docs/assistant-dashboard-workflow.md`.

```mermaid
flowchart TD
    Start["Visitor opens investor frontend"] --> Entry{"Choose entry"}

    Entry --> Root["/"]
    Entry --> Login["/login"]
    Entry --> Register["/register"]
    Entry --> Assistant["/assistant-register"]

    Root --> RootRedirect["Redirect to /welcome"]

    Register --> RegisterSubmit["Create account"]
    RegisterSubmit --> Welcome["/welcome"]

    Assistant --> AssistantQuestions["Conversational signup questions"]
    AssistantQuestions --> AssistantCreate["Register account"]
    AssistantCreate --> AssistantSeed["Seed onboarding: basic, experience, SEC, pathway"]
    AssistantSeed --> Dashboard["/dashboard"]

    Login --> LoginSubmit["Authenticate existing investor"]
    LoginSubmit --> Dashboard

    RootRedirect --> AuthGate{"Authenticated?"}
    Welcome --> AuthGate
    AuthGate -- No --> Login
    AuthGate -- Yes --> ActiveCheck{"Has active or funded investment?"}
    ActiveCheck -- Yes --> InvestorPanel["/investor"]
    ActiveCheck -- No --> OnboardingStart["Start onboarding"]
    OnboardingStart --> Dashboard

    Dashboard --> Complete{"All onboarding tasks complete?"}
    Complete -- No --> NextTask{"Open next onboarding task"}
    Complete -- Yes --> InvestorPanel

    NextTask --> Basic["/onboarding/basic"]
    Basic --> Experience["/onboarding/experience"]
    Experience --> SEC["/onboarding/sec"]
    SEC --> Pathway["/onboarding/pathway"]
    Pathway --> Profile["/onboarding/profile"]
    Profile --> Documents["/onboarding/documents"]

    Documents --> PartnerProof{"Partner proof required?"}
    PartnerProof -- Yes --> Documents
    PartnerProof -- No --> Track{"Pathway"}

    Track -- Accredited --> Accreditation["/onboarding/accreditation"]
    Accreditation --> Review["/onboarding/status"]

    Track -- Crowdfunding --> Review

    Review --> ReviewDecision{"Review approved and KYC approved?"}
    ReviewDecision -- No --> Resolve["Resolve missing, open, or rejected items"]
    Resolve --> Dashboard
    ReviewDecision -- Yes --> Funding["/onboarding/funding"]

    Funding --> FundingState{"Funding complete?"}
    FundingState -- No --> Funding
    FundingState -- Yes --> InvestorPanel
```

## Key Notes

- `/` redirects to `/welcome`.
- `/onboarding` redirects to `/dashboard`, so the onboarding dashboard acts as the hub for all next-step navigation.
- `ProtectedRoute` sends unauthenticated users to `/login`.
- `ProtectedRoute` also redirects users with an `active` or `funded` investment from onboarding entry pages to `/investor`.
- The assistant flow creates the account and pre-populates onboarding state with basic profile, experience and intent, SEC answers, and the selected pathway.
- The assistant then hands the user off to `/dashboard` to finish full profile details, document upload, accredited verification when required, review, and funding.
- `ReviewStatus` automatically forwards the user to `/onboarding/funding` once the package review is approved and KYC is approved.
- `FundingInstructions` can loop while an external purchase is still awaiting proof or admin review before the user fully transitions to `/investor`.

## Source Files

- `src/App.js`
- `src/components/ProtectedRoute.jsx`
- `src/lib/auth.js`
- `src/lib/onboarding.js`
- `src/pages/Register.jsx`
- `src/pages/Login.jsx`
- `src/pages/AssistantRegister.jsx`
- `src/pages/onboarding/WelcomePage.jsx`
- `src/pages/onboarding/BasicProfileForm.jsx`
- `src/pages/onboarding/ExperienceAndIntent.jsx`
- `src/pages/onboarding/SECScreening.jsx`
- `src/pages/onboarding/PathwaySelection.jsx`
- `src/pages/onboarding/FullProfileForm.jsx`
- `src/pages/onboarding/DocumentUpload.jsx`
- `src/pages/onboarding/AccreditedVerification.jsx`
- `src/pages/onboarding/ReviewStatus.jsx`
- `src/pages/onboarding/FundingInstructions.jsx`
- `src/pages/onboarding/Dashboard.jsx`
- `src/pages/InvestorPanel.jsx`
