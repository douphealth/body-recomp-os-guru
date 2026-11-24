import {describe,it,expect} from 'vitest';
import {writeFileSync,readFileSync} from 'node:fs';
import {calculatePlan,type UserInputs} from '../lib/calculations';
import {buildPlanPDF} from '../lib/pdf-generator';
const inputs:UserInputs={age:35,sex:'male',heightCm:180,weightKg:80,bodyFatPercent:20,goal:'recomp',workoutFrequency:3,stepCount:7000,dietStyle:'standard',equipmentAccess:'gym',runningInterest:false,experience:'beginner',sessionMinutes:45};
describe('printable workbook',()=>{
 it('generates a complete multi-page PDF with a valid header',()=>{
   const logo='data:image/png;base64,'+readFileSync('src/assets/logo.png').toString('base64');
   const doc=buildPlanPDF(calculatePlan(inputs),inputs,logo);
   const bytes=new Uint8Array(doc.output('arraybuffer'));
   expect(String.fromCharCode(...bytes.slice(0,5))).toBe('%PDF-');
   expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(29);
   expect(doc.getNumberOfPages()).toBeLessThan(90);
   expect(bytes.length).toBeGreaterThan(30000);
   if(process.env.FITNESS_PDF_QA)writeFileSync(process.env.FITNESS_PDF_QA,bytes);
 });
 it('also builds a high-frequency vegetarian workbook',()=>{
   const p={...inputs,workoutFrequency:6,dietStyle:'vegetarian' as const};
   expect(buildPlanPDF(calculatePlan(p),p).getNumberOfPages()).toBeLessThan(110);
 });
});
