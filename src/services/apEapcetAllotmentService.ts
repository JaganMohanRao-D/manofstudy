/**
 * Year-aware AP EAPCET allotment data service.
 * 2026 -> public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE
 * 2025 -> existing 2025 dataset.
 */
export type AllotmentYear = '2026' | '2025';

export interface AllotmentRecord {
  rank:number; cand_name:string; gender:string; category:string; region:string;
  alloted_category:string; phase:number; college_code:string; college_name:string;
  branch_code:string; branch_name:string; course_type?:string; district?:string;
  fee_with_exemption?:number; fee_with_no_exemption?:number; roll_no?:string;
  first_name_blurred?:string; last_name_visible?:string; roll_no_blurred?:string;
  roll_no_prefix?:string; total_seats?:number; left_over_seats?:number; id?:number;
}
export interface CollegeDetailData {
  college_code:string; college_name:string; file:string; recordCount:number; branchCount:number;
  branches:Array<{branch_code:string;branch_name:string;recordCount:number;records:AllotmentRecord[]}>;
  allRecords:AllotmentRecord[];
}
export interface CollegeListItem { collegeCode:string; collegeName:string; file:string; recordCount:number; }
export interface BranchSummary {
  collegeCode:string; collegeName:string; branchCode:string; branchName:string; count:number;
  minRank:number; maxRank:number;
  categoryRanks:Record<string,{minRank:number;maxRank:number;count:number}>;
}

const cache=new Map<string,CollegeDetailData>();
let indexPromise:Promise<CollegeListItem[]>|null=null;
let all2026Promise:Promise<CollegeDetailData[]>|null=null;

const normalize=(v:string)=>(v||'').toUpperCase().replace(/[^A-Z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const phaseNumber=(v:any)=>typeof v==='number'?v:(String(v??'').match(/(1|2|3)/)?.[1]?Number(String(v).match(/(1|2|3)/)![1]):0);

async function get2026Index():Promise<CollegeListItem[]> {
  if(indexPromise) return indexPromise;
  indexPromise=(async()=>{
    const r=await fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/index.json');
    if(!r.ok) throw new Error('Unable to load AP EAPCET 2026 index');
    const d=await r.json();
    return (d.colleges||[]).map((c:any)=>({
      collegeCode:String(c.college_code||c.collegeCode||'').trim(),
      collegeName:String(c.college_name||c.collegeName||'').trim(),
      file:String(c.file||((c.college_code||'')+'.json')),
      recordCount:Number(c.records??c.record_count??0)
    })).filter((c:CollegeListItem)=>c.collegeCode&&c.collegeName);
  })();
  return indexPromise;
}

export async function getCollegeList(year:AllotmentYear='2026'):Promise<CollegeListItem[]> {
  if(year==='2026') return get2026Index();
  const m=await import('../data/apEapcetCollegeManifest');
  return m.AP_EAPCET_COLLEGES.map((c:any)=>({collegeCode:c.collegeCode,collegeName:c.collegeName,file:c.file,recordCount:c.recordCount}));
}

function parseCollege(raw:any,meta:CollegeListItem):CollegeDetailData {
  const college_code=String(raw.college_code||raw.collegeCode||meta.collegeCode).trim();
  const college_name=String(raw.college_name||raw.collegeName||meta.collegeName).trim();
  const out:AllotmentRecord[]=[];
  const bm=new Map<string,{name:string;records:AllotmentRecord[]}>();
  const push=(r:any,bc?:string,bn?:string)=>{
    const rank=Number(String(r.rank??'').replace(/,/g,''));
    if(!Number.isFinite(rank)||rank<=0)return;
    const rec:AllotmentRecord={
      rank,cand_name:String(r.cand_name??r.applicant_name??r.name??'').trim(),
      gender:String(r.gender??'').trim().toUpperCase(),category:String(r.category??r.community??'').trim(),
      region:String(r.region??'').trim().toUpperCase(),
      alloted_category:String(r.alloted_category??r.allot_category??r.allotted_category??'').trim(),
      phase:phaseNumber(r.phase),college_code,college_name,
      branch_code:String(r.branch_code??bc??'').trim(),branch_name:String(r.branch_name??bn??r.branch??'').trim(),
      course_type:r.course_type,district:r.district,fee_with_exemption:r.fee_with_exemption,
      fee_with_no_exemption:r.fee_with_no_exemption,roll_no:r.roll_no,first_name_blurred:r.first_name_blurred,
      last_name_visible:r.last_name_visible,roll_no_blurred:r.roll_no_blurred,roll_no_prefix:r.roll_no_prefix,
      total_seats:r.total_seats,left_over_seats:r.left_over_seats,id:r.id
    };
    out.push(rec);
    const key=rec.branch_code||'UNKNOWN';
    if(!bm.has(key))bm.set(key,{name:rec.branch_name||key,records:[]});
    bm.get(key)!.records.push(rec);
  };
  if(Array.isArray(raw.records))raw.records.forEach((r:any)=>push(r));
  else if(Array.isArray(raw.branches))raw.branches.forEach((b:any)=>(b.records||[]).forEach((r:any)=>push(r,b.branch_code,b.branch_name)));
  const branches=Array.from(bm.entries()).map(([branch_code,v])=>({branch_code,branch_name:v.name,recordCount:v.records.length,records:v.records})).sort((a,b)=>a.branch_code.localeCompare(b.branch_code));
  return {college_code,college_name,file:meta.file,recordCount:out.length,branchCount:branches.length,branches,allRecords:out};
}

export async function getCollegeDetails(year:AllotmentYear,code:string):Promise<CollegeDetailData|null>{
  if(!code||code==='ALL')return null;
  const key=year+':'+code.toUpperCase();
  if(cache.has(key))return cache.get(key)!;
  const list=await getCollegeList(year);
  const meta=list.find(c=>c.collegeCode.toUpperCase()===code.toUpperCase());
  if(!meta)return null;
  const base=year==='2026'?'/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/':'/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/';
  const r=await fetch(base+meta.file);
  if(!r.ok)throw new Error('Unable to load '+meta.collegeName);
  const data=parseCollege(await r.json(),meta);
  cache.set(key,data); return data;
}

export async function loadAllColleges2026():Promise<CollegeDetailData[]>{
  if(all2026Promise)return all2026Promise;
  all2026Promise=(async()=>{
    const list=await get2026Index(); const result:CollegeDetailData[]=[];
    for(let i=0;i<list.length;i+=10){
      const part=await Promise.all(list.slice(i,i+10).map(async c=>{try{return await getCollegeDetails('2026',c.collegeCode)}catch{return null}}));
      result.push(...part.filter(Boolean) as CollegeDetailData[]);
    }
    return result;
  })();
  return all2026Promise;
}

export async function search2026(o:{nameQuery?:string;rank?:number;collegeCode?:string;branchCode?:string;phase?:number|string;category?:string;limit?:number}):Promise<AllotmentRecord[]>{
  const limit=o.limit??200;
  const cs=o.collegeCode&&o.collegeCode!=='ALL'?[await getCollegeDetails('2026',o.collegeCode)].filter(Boolean) as CollegeDetailData[]:await loadAllColleges2026();
  const name=normalize(o.nameQuery||''); const phase=o.phase&&o.phase!=='ALL'?Number(o.phase):0; const out:AllotmentRecord[]=[];
  for(const c of cs)for(const r of c.allRecords){
    if(name&&!normalize(r.cand_name).includes(name))continue;
    if(o.rank&&r.rank!==o.rank)continue;
    if(o.branchCode&&o.branchCode!=='ALL'&&r.branch_code!==o.branchCode)continue;
    if(phase&&r.phase!==phase)continue;
    if(o.category&&o.category!=='ALL'&&r.category!==o.category)continue;
    out.push(r);if(out.length>=limit)return out;
  } return out;
}

export async function get2026BranchSummaries():Promise<BranchSummary[]>{
  const cs=await loadAllColleges2026();const out:BranchSummary[]=[];
  for(const c of cs)for(const b of c.branches){
    const cats:Record<string,{minRank:number;maxRank:number;count:number}>={};let min=Infinity,max=0;
    for(const r of b.records){
      min=Math.min(min,r.rank);max=Math.max(max,r.rank);const k=r.category||'UNKNOWN';
      if(!cats[k])cats[k]={minRank:Infinity,maxRank:0,count:0};
      cats[k].minRank=Math.min(cats[k].minRank,r.rank);cats[k].maxRank=Math.max(cats[k].maxRank,r.rank);cats[k].count++;
    }
    out.push({collegeCode:c.college_code,collegeName:c.college_name,branchCode:b.branch_code,branchName:b.branch_name,count:b.records.length,minRank:min===Infinity?0:min,maxRank:max,categoryRanks:cats});
  } return out;
}
