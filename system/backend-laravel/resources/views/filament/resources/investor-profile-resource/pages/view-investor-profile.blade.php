<x-filament-panels::page
    @class([
        'fi-resource-view-record-page',
        'fi-resource-' . str_replace('/', '-', $this->getResource()::getSlug()),
        'fi-resource-record-' . $record->getKey(),
    ])
>
    @php
        $relationManagers = $this->getRelationManagers();
        $hasCombinedRelationManagerTabsWithContent = $this->hasCombinedRelationManagerTabsWithContent();
        $holdingStats = $this->holdingStats();
        $complianceItems = $this->complianceItems();
        $latestIssues = $this->latestDocumentIssues();
        $blockers = $this->blockers();
        $recentActivity = $this->recentActivity();
    @endphp

    <div class="space-y-6">
        <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">Investor Profile</p>
                    <h1 class="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{{ $record->full_name ?: 'Unknown investor' }}</h1>
                    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {{ $record->email ?: 'No email' }}
                        @if($record->phone)
                            · {{ $record->phone }}
                        @endif
                    </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                    <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Pathway</p>
                        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{{ $this->formatStatus($record->investor_type) }}</p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">KYC</p>
                        <p class="mt-2">
                            <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold {{ $this->statusBadgeClass($record->track_status ?: $record->status) }}">
                                {{ $record->track_status ? $this->formatStatus($record->track_status) : $this->formatStatus($record->status) }}
                            </span>
                        </p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Direct Committed</p>
                        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">${{ number_format($holdingStats['direct_total'], 2) }}</p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Crowdfunder Committed</p>
                        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">${{ number_format($holdingStats['crowdfunder_total'], 2) }}</p>
                    </div>
                </div>
            </div>
        </section>

        @if (count($blockers))
            <section class="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">Current Blockers</p>
                <div class="mt-4 space-y-2 text-sm text-amber-900 dark:text-amber-100">
                    @foreach ($blockers as $blocker)
                        <p>• {{ $blocker }}</p>
                    @endforeach
                </div>
            </section>
        @endif

        <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Compliance</p>
                    <h2 class="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Document and approval status</h2>
                </div>
                <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold {{ $this->statusBadgeClass($record->status) }}">
                    {{ $this->formatStatus($record->status) }}
                </span>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @foreach ($complianceItems as $item)
                    <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">{{ $item['label'] }}</p>
                            <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold {{ $this->statusBadgeClass($item['status']) }}">
                                {{ $this->formatStatus($item['status']) }}
                            </span>
                        </div>

                        <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">{{ $item['detail'] }}</p>

                        @if ($item['reason'])
                            <p class="mt-3 text-sm text-red-700 dark:text-red-300">{{ $item['reason'] }}</p>
                        @endif

                        <div class="mt-4 flex flex-wrap items-center gap-2">
                            @if ($item['can_approve'] && $item['submission_id'])
                                <x-filament::button
                                    color="success"
                                    size="sm"
                                    wire:click="approveDocumentSubmission({{ $item['submission_id'] }})"
                                >
                                    Approve
                                </x-filament::button>
                            @endif

                            @if ($item['review_url'])
                                <x-filament::button
                                    tag="a"
                                    color="gray"
                                    size="sm"
                                    :href="$item['review_url']"
                                >
                                    Review
                                </x-filament::button>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>

            @if (count($latestIssues))
                <div class="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-red-700 dark:text-red-300">Latest Issues</p>
                    <div class="mt-3 space-y-2 text-sm text-red-800 dark:text-red-100">
                        @foreach ($latestIssues as $issue)
                            <p><span class="font-semibold">{{ $issue['label'] }}:</span> {{ $issue['reason'] }}</p>
                        @endforeach
                    </div>
                </div>
            @endif
        </section>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Core Profile</p>
                <div class="mt-5 grid gap-y-4">
                    @foreach ($this->profileRows() as $row)
                        <div class="grid gap-2 border-b border-gray-100 pb-4 dark:border-white/10 sm:grid-cols-[180px_minmax(0,1fr)]">
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $row['label'] }}</p>
                            <p class="text-sm text-gray-900 dark:text-white">{{ $row['value'] }}</p>
                        </div>
                    @endforeach
                </div>
            </section>

            <aside class="space-y-6">
                <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Holdings Snapshot</p>
                    <div class="mt-5 space-y-4">
                        <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Direct investments</p>
                            <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ $holdingStats['direct_count'] }}</p>
                        </div>
                        <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Crowdfunder holdings</p>
                            <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ $holdingStats['crowdfunder_count'] }}</p>
                        </div>
                    </div>
                </section>

                <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Recent Activity</p>
                    <div class="mt-5 space-y-4">
                        @forelse ($recentActivity as $activity)
                            <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10 dark:bg-white/5">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white">{{ $activity['title'] }}</p>
                                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ $activity['detail'] }}</p>
                                    </div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ $activity['at'] }}</span>
                                </div>
                                <p class="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">By {{ $activity['by'] }}</p>
                            </div>
                        @empty
                            <p class="text-sm text-gray-600 dark:text-gray-300">No recent workflow activity.</p>
                        @endforelse
                    </div>
                </section>
            </aside>
        </div>
    </div>

    @if (count($relationManagers))
        <x-filament-panels::resources.relation-managers
            class="mt-6"
            :active-locale="isset($activeLocale) ? $activeLocale : null"
            :active-manager="$this->activeRelationManager ?? ($hasCombinedRelationManagerTabsWithContent ? null : array_key_first($relationManagers))"
            :content-tab-label="$this->getContentTabLabel()"
            :content-tab-icon="$this->getContentTabIcon()"
            :content-tab-position="$this->getContentTabPosition()"
            :managers="$relationManagers"
            :owner-record="$record"
            :page-class="static::class"
        >
            @if ($hasCombinedRelationManagerTabsWithContent)
                <x-slot name="content">
                    @if ($this->hasInfolist())
                        {{ $this->infolist }}
                    @else
                        {{ $this->form }}
                    @endif
                </x-slot>
            @endif
        </x-filament-panels::resources.relation-managers>
    @endif
</x-filament-panels::page>
