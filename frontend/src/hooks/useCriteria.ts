import { useLanguage } from '../context/LanguageContext';
import { CRITERIA as BASE_CRITERIA } from '../constants/data';
import type { Criterion } from '../types';

export function useCriteria(): Criterion[] {
  const { t } = useLanguage();

  return BASE_CRITERIA.map(criterion => {
    // Determine which criterion it is to get the correct translation key
    const cId = criterion.id; // e.g. 'c1'

    return {
      ...criterion,
      name: t(`criteria.${cId}.name`),
      description: t(`criteria.${cId}.desc`),
      rubrics: criterion.rubrics.map((r, i) => {
        // rubric index + 1 (r1, r2, r3)
        return {
          ...r,
          desc: t(`criteria.${cId}.r${i + 1}`)
        };
      })
    };
  });
}
