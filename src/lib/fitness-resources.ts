import type { UserInputs } from './calculations';
export type Resource={title:string;description:string;url:string;section:'Training'|'Nutrition'|'Running'|'Trust'};
const training:Resource={title:'Strength training hub',description:'Explore resistance training principles and equipment guides.',url:'https://gearuptofit.com/strength-training-hub/',section:'Training'};
const consistency:Resource={title:'Build a sustainable exercise habit',description:'Make your sessions easier to start, schedule and maintain.',url:'https://gearuptofit.com/fitness/gear-up-to-fit/',section:'Training'};
const fueling:Resource={title:'Nutrition plan for an athlete',description:'Understand training-day fueling, protein distribution, hydration and recovery meals.',url:'https://gearuptofit.com/nutrition/nutrition-plan-for-an-athlete/',section:'Nutrition'};
const nutrition:Resource={title:'Nutrition and fueling library',description:'Explore nutrition, hydration and practical meal-planning guidance.',url:'https://gearuptofit.com/nutrition/',section:'Nutrition'};
const running:Resource={title:'How to choose running shoes',description:'Match footwear to fit, comfort, surface and workload.',url:'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/',section:'Running'};
const about:Resource={title:'About GearUpToFit',description:'Learn about the publisher, editorial approach and accountability.',url:'https://gearuptofit.com/about-us/',section:'Trust'};
export function usefulResources(inputs?:UserInputs):Resource[]{return [training,consistency,nutrition,fueling,...(!inputs||inputs.runningInterest?[running]:[]),about];}
