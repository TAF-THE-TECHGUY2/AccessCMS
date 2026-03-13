<?php

namespace App\Filament\Pages;

use App\Services\PlatformConfigService;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class PlatformSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Platform Settings';

    protected static ?string $navigationGroup = 'Configuration';

    protected static ?string $title = 'Platform Settings';

    protected static string $view = 'filament.pages.platform-settings';

    public ?array $data = [];

    public function mount(PlatformConfigService $platformConfig): void
    {
        $config = $platformConfig->current();

        $this->form->fill([
            'wefunder_provider_name' => $config->wefunder_provider_name ?: 'Wefunder',
            'wefunder_campaign_url' => $config->wefunder_campaign_url,
            'verify_provider_name' => $config->verify_provider_name ?: 'Verify.com',
            'verify_verification_url' => $config->verify_verification_url,
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->statePath('data')
            ->schema([
                Section::make('Crowdfunder provider')
                    ->description('Configure the external campaign destination used for crowdfunder purchases.')
                    ->schema([
                        TextInput::make('wefunder_provider_name')
                            ->label('Provider name')
                            ->required()
                            ->maxLength(255)
                            ->default('Wefunder'),
                        TextInput::make('wefunder_campaign_url')
                            ->label('Campaign URL')
                            ->url()
                            ->required()
                            ->maxLength(2048)
                            ->helperText('Investors are redirected here when they start the crowdfunder purchase flow.'),
                    ]),
                Section::make('Accredited verification provider')
                    ->description('Configure the external verification destination used for accredited verification.')
                    ->schema([
                        TextInput::make('verify_provider_name')
                            ->label('Provider name')
                            ->required()
                            ->maxLength(255)
                            ->default('Verify.com'),
                        TextInput::make('verify_verification_url')
                            ->label('Verification URL')
                            ->url()
                            ->required()
                            ->maxLength(2048)
                            ->helperText('Accredited investors are sent here to complete third-party verification.'),
                    ]),
            ]);
    }

    public function save(PlatformConfigService $platformConfig): void
    {
        $platformConfig->update($this->form->getState());

        Notification::make()
            ->title('Platform settings saved')
            ->success()
            ->body('External provider settings have been updated.')
            ->send();
    }
}
