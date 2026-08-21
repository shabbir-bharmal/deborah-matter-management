import { useOutletContext } from 'react-router-dom';

import type { Investigation } from '~/types';

export function useInvestigation(): Investigation {
    return useOutletContext<Investigation>();
}
