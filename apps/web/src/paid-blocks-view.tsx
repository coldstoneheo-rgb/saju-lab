import type { PaidReportV1 } from "@saju-lab/saju-core";
import { gyeokgukAgreementLabel, agreementLabel, paidBlocksViewOf, YONGSIN_EMPTY, type PaidBlockRow } from "./paid-blocks.js";

// 유료 3블록(HO-2026-1120): 세트별 결과를 나란히, 안내는 묶음 전체 1회. 뜻풀이·길흉 없음(문안은 다음 회차).
export function PaidStructureBlocks({ paidReport }: { paidReport: PaidReportV1 }): JSX.Element {
  const view = paidBlocksViewOf(paidReport);
  return (
    <div className="paidStructure" aria-label="강약 · 용신 후보 · 격국" id="paid-structure">
      <h4>강약 · 용신 후보 · 격국</h4>
      <p>{view.note}</p>
      <div className="paidSectionGrid">
        <PaidBlockCard title="강약 판독" badge={agreementLabel(view.strength.agrees)} rows={view.strength.rows} empty="" />
        <PaidBlockCard title="용신 후보" rows={view.yongsin} empty={YONGSIN_EMPTY} />
        <PaidBlockCard title="격국" badge={gyeokgukAgreementLabel(view.gyeokguk)} rows={view.gyeokguk.rows} empty="" />
      </div>
    </div>
  );
}

function PaidBlockCard({ badge, empty, rows, title }: { badge?: string; empty: string; rows: PaidBlockRow[]; title: string }): JSX.Element {
  return (
    <article className="paidPreviewCard" aria-label={title}>
      <h4>{title}{badge ? <small className="chip">{badge}</small> : null}</h4>
      {rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={`${row.label}-${row.value}`}><strong>{row.label}</strong> {row.value}</li>
          ))}
        </ul>
      ) : <p>{empty}</p>}
    </article>
  );
}
