import { cn } from "../lib/utils"; 

export default function QuizQuestion({ question, selectedAnswer, onSelect, questionNumber, totalQuestions }) {
  return (
    <div className="">
      {/* Progress */}
      <div className="mb-6 w-full max-w-2xl">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl w-full">
  <h3 className="mb-4 text-xl font-semibold text-foreground md:text-2xl">
    {question.text}
  </h3>

  <div className="space-y-3">
    {question.options.map((option) => (
      <button
        key={option.value}
        onClick={() => onSelect(option.value)}
        className={cn(
          "w-full rounded-xl border-2 p-4 text-left font-medium transition-all duration-300",
          selectedAnswer === option.value
            ? "border-primary bg-primary/10 text-primary shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted"
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
              selectedAnswer === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {option.value}
          </span>
          {option.label}
        </span>
      </button>
    ))}
  </div>
</div>

    </div>
  );
}
