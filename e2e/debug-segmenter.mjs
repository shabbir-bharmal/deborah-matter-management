// Temp debug: segmenter on numbered custom heading.
import { segmentByHeadings } from '../resources/js/src/features/reportAutoFill/mapping/rules/sectionSegmenter.ts';

const text = ['1. HR Recommendations', 'Provide refresher training to all team leads by end of quarter.'].join('\n');
console.log(JSON.stringify(segmentByHeadings(text), null, 2));

const flat = '1. MATTER SUMMARY Investigation INV-2026-001 was opened for Northwind Logistics.';
console.log(JSON.stringify(segmentByHeadings(flat), null, 2));


