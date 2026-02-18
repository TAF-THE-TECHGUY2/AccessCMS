<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OnboardingRejected extends Notification
{
    use Queueable;

    public function __construct(private ?string $reason = null)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Your onboarding was not approved')
            ->line('Your investor onboarding was not approved at this time.');

        if ($this->reason) {
            $message->line('Reason: ' . $this->reason);
        }

        return $message;
    }
}
