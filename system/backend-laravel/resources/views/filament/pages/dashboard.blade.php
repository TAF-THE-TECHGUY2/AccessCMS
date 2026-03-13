<x-filament::page>
    <div class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">Operations</p>
            <h1 class="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">Investor onboarding control center</h1>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Use this dashboard to keep investor onboarding moving: review packages, clear document queues,
                approve KYC, and monitor funding operations.
            </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            @foreach ($stats as $stat)
                <a href="{{ $stat['url'] }}" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow dark:border-white/10 dark:bg-gray-900 dark:hover:border-white/20 dark:hover:bg-white/5">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">{{ $stat['label'] }}</p>
                    <div class="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{{ $stat['value'] }}</div>
                    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{{ $stat['description'] }}</p>
                </a>
            @endforeach
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
            <div class="space-y-6">
                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Compliance review queue</h2>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Onboarding packages waiting for a compliance decision.</p>
                        </div>
                        <a href="{{ \App\Filament\Resources\InvestorOnboardingResource::getUrl('index') }}" class="text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-white">Open queue</a>
                    </div>

                    <div class="mt-5 space-y-3">
                        @forelse ($pendingOnboardings as $onboarding)
                            <div class="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <a href="{{ $this->onboardingUrl($onboarding) }}" class="font-medium text-gray-900 hover:underline dark:text-white">
                                            {{ $onboarding->user?->name ?: 'Unknown investor' }}
                                        </a>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Pathway: {{ $this->formatStatus($onboarding->pathway) }}
                                            @if($onboarding->submitted_at)
                                                · Submitted {{ $onboarding->submitted_at->diffForHumans() }}
                                            @endif
                                        </p>
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $this->waitingLabel($onboarding->submitted_at ?: $onboarding->created_at) }}</p>
                                    </div>
                                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold {{ $this->statusBadgeClass($onboarding->review_status) }}">
                                        {{ $this->formatStatus($onboarding->review_status) }}
                                    </span>
                                </div>
                                <div class="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        wire:click="approveOnboarding({{ $onboarding->id }})"
                                        class="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                                    >
                                        Approve Package
                                    </button>
                                    <a href="{{ $this->onboardingUrl($onboarding) }}" class="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:border-white/15 dark:text-white">
                                        Open Review
                                    </a>
                                </div>
                            </div>
                        @empty
                            <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                No onboarding packages are waiting for compliance review.
                            </div>
                        @endforelse
                    </div>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Pending document reviews</h2>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Partner proof, payment proof, shares confirmations, and other submissions awaiting action.</p>
                        </div>
                        <a href="{{ \App\Filament\Resources\DocumentSubmissionResource::getUrl('index') }}" class="text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-white">Open submissions</a>
                    </div>

                    <div class="mt-5 space-y-3">
                        @forelse ($pendingSubmissions as $submission)
                            <div class="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <a href="{{ $this->submissionUrl($submission) }}" class="font-medium text-gray-900 hover:underline dark:text-white">
                                            {{ $submission->user?->email ?: 'Unknown investor' }}
                                        </a>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {{ $submission->documentType?->name ?: 'Unknown document' }}
                                            @if($submission->created_at)
                                                · Uploaded {{ $submission->created_at->diffForHumans() }}
                                            @endif
                                        </p>
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $this->waitingLabel($submission->created_at) }}</p>
                                    </div>
                                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold {{ $this->statusBadgeClass($submission->status) }}">
                                        {{ $this->formatStatus($submission->status) }}
                                    </span>
                                </div>
                                <div class="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        wire:click="approveSubmission({{ $submission->id }})"
                                        class="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                                    >
                                        Approve Submission
                                    </button>
                                    <a href="{{ $this->submissionUrl($submission) }}" class="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:border-white/15 dark:text-white">
                                        Open Submission
                                    </a>
                                </div>
                            </div>
                        @empty
                            <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                No document submissions are currently waiting for review.
                            </div>
                        @endforelse
                    </div>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ready for KYC approval</h2>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Onboarding is approved, but the investor profile still needs KYC approval.</p>
                        </div>
                        <a href="{{ \App\Filament\Resources\InvestorProfileResource::getUrl('index') }}" class="text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-white">Open investor profiles</a>
                    </div>

                    <div class="mt-5 space-y-3">
                        @forelse ($readyForKyc as $onboarding)
                            @php($profile = $onboarding->user?->investorProfile)
                            <div class="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <a href="{{ $profile ? $this->investorProfileUrl($profile) : '#' }}" class="font-medium text-gray-900 hover:underline dark:text-white">
                                            {{ $profile?->full_name ?: ($onboarding->user?->name ?: 'Unknown investor') }}
                                        </a>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Pathway: {{ $this->formatStatus($onboarding->pathway) }}
                                            · Profile status: {{ $this->formatStatus($profile?->status) }}
                                            · Track status: {{ $this->formatStatus($profile?->track_status) }}
                                        </p>
                                        @if($profile?->partner_status && strtolower($profile->partner_status) !== 'not_required')
                                            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Partner proof: {{ $this->formatStatus($profile->partner_status) }}</p>
                                        @endif
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $this->waitingLabel($onboarding->approved_at ?: $onboarding->updated_at) }}</p>
                                    </div>
                                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold {{ $this->statusBadgeClass('blocked') }}">
                                        Pending KYC
                                    </span>
                                </div>
                                @if($profile)
                                    <div class="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            wire:click="approveInvestor({{ $profile->id }})"
                                            class="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                                        >
                                            Approve Investor
                                        </button>
                                        <a href="{{ $this->investorProfileUrl($profile) }}" class="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:border-white/15 dark:text-white">
                                            Open Profile
                                        </a>
                                    </div>
                                @endif
                            </div>
                        @empty
                            <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                No investors are currently waiting on KYC approval.
                            </div>
                        @endforelse
                    </div>
                </section>
            </div>

            <div class="space-y-6">
                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Funding operations</h2>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Pending direct payment proofs and external crowdfunder purchases.</p>
                        </div>
                    </div>

                    <div class="mt-5 space-y-4">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Payment proofs</h3>
                            <div class="mt-3 space-y-3">
                                @forelse ($pendingPayments as $payment)
                                    <a href="{{ $this->paymentUrl($payment) }}" class="block rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5">
                                        <p class="font-medium text-gray-900 dark:text-white">
                                            {{ $payment->investment?->investorProfile?->full_name ?: 'Unknown investor' }}
                                        </p>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Amount: ${{ number_format((float) $payment->amount, 2) }}
                                            @if($payment->created_at)
                                                · Submitted {{ $payment->created_at->diffForHumans() }}
                                            @endif
                                        </p>
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $this->waitingLabel($payment->created_at) }}</p>
                                    </a>
                                @empty
                                    <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                        No direct payment proofs are waiting for review.
                                    </div>
                                @endforelse
                            </div>
                        </div>

                        <div>
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">External purchases</h3>
                            <div class="mt-3 space-y-3">
                                @forelse ($pendingExternalPurchases as $purchase)
                                    <a href="{{ $this->externalPurchaseUrl($purchase) }}" class="block rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5">
                                        <p class="font-medium text-gray-900 dark:text-white">{{ $purchase->user?->email ?: 'Unknown investor' }}</p>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {{ $purchase->offering?->title ?: 'Unknown offering' }}
                                            · Ref {{ $purchase->reference }}
                                        </p>
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $this->waitingLabel($purchase->created_at) }}</p>
                                    </a>
                                @empty
                                    <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                        No external purchases are pending review.
                                    </div>
                                @endforelse
                            </div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Needs attention</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Most recent rejected onboarding packages and rejected document reviews.</p>

                    <div class="mt-5 space-y-3">
                        @forelse ($rejectedOnboardings as $onboarding)
                            <a href="{{ $this->onboardingUrl($onboarding) }}" class="block rounded-xl border border-red-200 bg-red-50 p-4 transition hover:border-red-300 dark:border-red-500/30 dark:bg-red-500/10">
                                <p class="font-medium text-red-900 dark:text-red-100">{{ $onboarding->user?->name ?: 'Unknown investor' }}</p>
                                <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                                    Onboarding rejected
                                    @if($onboarding->rejected_at)
                                        · {{ $onboarding->rejected_at->diffForHumans() }}
                                    @endif
                                </p>
                            </a>
                        @empty
                        @endforelse

                        @forelse ($rejectedSubmissions as $submission)
                            <a href="{{ $this->submissionUrl($submission) }}" class="block rounded-xl border border-red-200 bg-red-50 p-4 transition hover:border-red-300 dark:border-red-500/30 dark:bg-red-500/10">
                                <p class="font-medium text-red-900 dark:text-red-100">{{ $submission->user?->email ?: 'Unknown investor' }}</p>
                                <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {{ $submission->documentType?->name ?: 'Unknown document' }} rejected
                                    @if($submission->reviewed_at)
                                        · {{ $submission->reviewed_at->diffForHumans() }}
                                    @endif
                                </p>
                            </a>
                        @empty
                        @endforelse

                        @if($rejectedOnboardings->isEmpty() && $rejectedSubmissions->isEmpty())
                            <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-white/15 dark:text-gray-300">
                                No recent rejected onboarding or document items.
                            </div>
                        @endif
                    </div>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Quick links</h2>
                    <div class="mt-5 space-y-3">
                        @foreach ($quickLinks as $link)
                            <a href="{{ $link['url'] }}" class="block rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5">
                                <p class="font-medium text-gray-900 dark:text-white">{{ $link['label'] }}</p>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ $link['description'] }}</p>
                            </a>
                        @endforeach
                    </div>
                </section>
            </div>
        </div>
    </div>
</x-filament::page>
