import React from "react";
import { faqContent } from "../../data/faqContent.js";
import OptionButton from "./OptionButton.jsx";
import PrimaryButton from "./PrimaryButton.jsx";
import StepCard from "./StepCard.jsx";

export default function FAQScreen({ selectedFaqId, onSelectFaq, onAskAnother, onContinue }) {
  const activeFaq = faqContent.find((item) => item.id === selectedFaqId) || null;

  if (!activeFaq) {
    return (
      <StepCard
        eyebrow="Explore First"
        title="What would you like to know?"
        description="Choose a question to get a clear answer before continuing your onboarding."
      >
        <div className="grid gap-3">
          {faqContent.map((faq) => (
            <OptionButton
              key={faq.id}
              title={faq.question}
              description="View a short answer"
              onClick={() => onSelectFaq(faq.id)}
            />
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-ap-border bg-ap-panel px-4 py-5 text-sm leading-6 text-ap-muted">
          You can review one or several questions, then continue whenever you feel ready.
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard eyebrow="FAQ" title={activeFaq.question}>
      <div className="rounded-[24px] border border-ap-border bg-ap-panel px-5 py-6 text-sm leading-7 text-ap-muted">
        {activeFaq.answer}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAskAnother}
          className="inline-flex items-center justify-center rounded-xl border border-ap-border bg-white px-5 py-3 text-sm font-medium text-ap-ink transition hover:border-ap-teal/40 hover:text-ap-teal"
        >
          Ask another question
        </button>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </StepCard>
  );
}
