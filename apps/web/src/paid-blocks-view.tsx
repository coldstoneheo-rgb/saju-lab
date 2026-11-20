import type { PaidReportV1 } from "@saju-lab/saju-core";
import { paidReadingOfReport, WHY_SUMMARY, type ReadingCard } from "./paid-reading.js";

// 유료 3블록 뜻풀이 화면(HO-2026-1120 plain-reading): 안내 1회 → 한눈에 → 카드 2개. 문안은 paid-reading.ts(순수 모듈)가 만들고 여기서는 배치만 한다.
// 카드마다 conclusion · meaning은 펼치고, basis(근거 · 방식 풀이 · 갈리는 까닭)만 <details>로 접는다.
export function PaidStructureBlocks({ paidReport }: { paidReport: PaidReportV1 }): JSX.Element {
  const reading = paidReadingOfReport(paidReport);
  return (
    <div className="paidStructure" aria-label="기운의 세기 · 보탬이 되는 기운 · 큰 틀" id="paid-structure">
      <h4>기운의 세기 · 보탬이 되는 기운 · 큰 틀</h4>
      <p>{reading.note}</p>
      <section className="paidPreviewCard paidGlance" aria-label={reading.glance.title}>
        <h4>{reading.glance.title}</h4>
        <ol>
          {reading.glance.sentences.map((sentence) => <li key={sentence}>{sentence}</li>)}
        </ol>
      </section>
      <div className="paidSectionGrid">
        <PaidReadingCard card={reading.energy} />
        <PaidReadingCard card={reading.frame} />
      </div>
    </div>
  );
}

function PaidReadingCard({ card }: { card: ReadingCard }): JSX.Element {
  return (
    <article className="paidPreviewCard paidReadingCard" aria-label={card.title}>
      <h4>{card.title}<small className="chip">{card.badge}</small></h4>
      <p className="paidQuestion">{card.question}</p>
      {card.notes.map((sentence) => <p key={sentence}>{sentence}</p>)}
      <ul>
        {card.lines.map((line) => (
          <li key={line.label}>
            <span className="paidLineLabel">{line.label}</span>
            <strong>{line.conclusion}</strong>
            {line.meaning.map((sentence) => <p key={sentence}>{sentence}</p>)}
          </li>
        ))}
      </ul>
      <details className="paidWhy">
        <summary>{WHY_SUMMARY}</summary>
        {card.lines.filter((line) => line.basis.length).map((line) => (
          <div key={line.label}>
            <h5>{line.label}</h5>
            <ul>{line.basis.map((sentence) => <li key={sentence}>{sentence}</li>)}</ul>
          </div>
        ))}
        <ul>{card.basis.map((sentence) => <li key={sentence}>{sentence}</li>)}</ul>
      </details>
    </article>
  );
}
