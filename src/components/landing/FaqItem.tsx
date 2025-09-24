import { useState } from 'react';

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
}

export default function FaqItem({ question, answer, isOpen = false }: FaqItemProps) {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-lg"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">
            {question}
          </h3>
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>
      
      <div
        id={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-4">
          <p className="text-gray-700 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}