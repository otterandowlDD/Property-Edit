// Run against two local production servers: BASE_URL (no Maps config), MAPS_TEST_URL
// (test-only config). PE_TEST_RESOLVE_FROM points to a package.json with Playwright.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(process.env.PE_TEST_RESOLVE_FROM||process.cwd()+'/package.json');
const {chromium}=require('playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:3103';
const configured=process.env.MAPS_TEST_URL||'http://127.0.0.1:3104';
const directory=JSON.parse(await fs.readFile(new URL('../content/projects.json',import.meta.url)));
const availability=JSON.parse(await fs.readFile(new URL('../content/listing-availability.json',import.meta.url)));
const ids=directory.projects.flatMap(p=>p.listingIds);
assert.equal(ids.length,135);assert.equal(new Set(ids).size,135);
assert.deepEqual([...ids].sort(),availability.items.map(x=>x.id).sort());
assert.equal(directory.projects.length,124);
const verified=directory.projects.filter(p=>p.status==='verified');
assert.equal(verified.length,2);
for(const p of directory.projects){if(p.status==='verified'){assert.ok(p.lat&&p.lng&&p.sources.length&&p.verifiedAt);}else{assert.equal(p.lat,null);assert.equal(p.lng,null);}}
const project=id=>directory.projects.find(p=>p.listingIds.includes(id));
assert.equal(project('31'),project('38'));assert.equal(project('72'),project('74'));
assert.equal(project('88'),project('118'));assert.notEqual(project('36'),project('88'));
assert.notEqual(project('70'),project('87'));assert.equal(project('84').status,'pending');
const sdk=`window.__mapEvents=[];
class TestMap{constructor(el,options){this.el=el;window.__mapEvents.push(['map',options.mapId]);}fitBounds(b,p){window.__mapEvents.push(['bounds',b.points,p]);}panTo(p){window.__mapEvents.push(['pan',p]);}setZoom(z){window.__mapEvents.push(['zoom',z]);}}
class TestBounds{constructor(){this.points=[];}extend(p){this.points.push(p);}}
class TestMarker extends HTMLElement{constructor(options){super();this.position=options.position;this.map=options.map;}set map(value){this._map=value;if(value)value.el.append(this);else this.remove();}get map(){return this._map;}addListener(){return {remove(){}};}}
customElements.define('test-google-marker',TestMarker);
window.google={maps:{Map:TestMap,LatLngBounds:TestBounds,marker:{AdvancedMarkerElement:TestMarker},event:{clearInstanceListeners(){}},importLibrary:async()=>({})}};window.peMapsReady?.();`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const report={directory:{listings:135,projects:124,verified:2,pending:122},sdk:'isolated test double; not live Google Maps',passed:[]};
const check=(name)=>report.passed.push(name);
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let googleRequests=0;await page.route('https://maps.googleapis.com/**',route=>{googleRequests++;return route.abort();});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('status').filter({hasText:'แผนที่ยังไม่พร้อมใช้งาน'}).waitFor();assert.equal(googleRequests,0);check('missing credentials: no SDK/key request, usable fallback');
 await page.getByLabel('ประเภทประกาศ').selectOption('all');assert.equal(await page.locator('.card').count(),135);assert.equal(await page.locator('.card img').count(),135);check('135 source-available cards with existing single covers');
 await page.getByLabel('ค้นหาโครงการหรือทำเล').fill('IDEO Rama 9');assert.equal(await page.locator('.card').count(),2);check('reviewed Thai/English aliases search together');
 await page.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();
 await page.locator('.project-options button').filter({hasText:'Life Asoke Hype'}).click();
 await page.getByRole('button',{name:'ดูห้องในโครงการนี้'}).click();assert.equal(await page.locator('.card').count(),2);check('fallback project-to-list filter');
 await page.getByLabel('งบประมาณสูงสุด').selectOption('15000');assert.equal(await page.locator('.card').count(),0);check('project filter intersects existing price filter');
 await page.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();assert.equal(await page.locator('.card').count(),118);check('reset restores rental filter');
 const mapPage=await browser.newPage({viewport:{width:1440,height:1000}});mapPage.on('pageerror',e=>errors.push(e.message));
 await mapPage.route('https://maps.googleapis.com/**',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await mapPage.goto(configured,{waitUntil:'networkidle'});await mapPage.locator('.owl-marker').first().waitFor();
 assert.equal(await mapPage.locator('.owl-marker').count(),2);assert.deepEqual(await mapPage.evaluate(()=>window.__mapEvents.find(e=>e[0]==='bounds')[1]),verified.map(p=>({lat:p.lat,lng:p.lng})));check('two project markers at exact verified coordinates and fitted bounds');
 let interactions=0;
 for(const name of ['Life Asoke Hype',"ควินทารา มาย'เซน พร้อมพงษ์"]){
  await mapPage.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();
  await mapPage.locator('.owl-marker[aria-label="'+name.replaceAll('"','\\"')+'"]:'+'visible').click();
  await mapPage.getByLabel('ข้อมูลโครงการที่เลือก').waitFor();await mapPage.locator('.project-summary').scrollIntoViewIfNeeded();await mapPage.waitForFunction(()=>document.querySelector('.project-cover img')?.naturalWidth>0);
  assert.equal(await mapPage.locator('.owl-marker[aria-pressed=true]').count(),1);
  await mapPage.getByRole('button',{name:'ดูห้องในโครงการนี้'}).click();
  const expected=name==='Life Asoke Hype'?['72','74']:['4'];
  assert.deepEqual(await mapPage.locator('.card').evaluateAll(cs=>cs.map(c=>c.dataset.listingId)),expected);
  assert.equal(await mapPage.locator('.owl-marker').count(),1);interactions++;
 }
 report.mapToListInteractions=interactions;check('two owl marker → summary → project-only listings interactions');
 await mapPage.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();
 await mapPage.locator('[data-listing-id="74"] .show-project').click();
 assert.equal(await mapPage.locator('.project-summary h3').textContent(),'Life Asoke Hype');check('listing-to-map project selection');
 await mapPage.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();
 await mapPage.locator('[data-listing-id="2"] .show-project').click();assert.ok((await mapPage.locator('.project-summary').textContent()).includes('รอตรวจสอบ'));assert.equal(await mapPage.locator('.owl-marker').count(),2);check('missing coordinates never create guessed pins');
 await mapPage.getByLabel('ค้นหาโครงการหรือทำเล').fill('ไม่มีโครงการนี้');assert.equal(await mapPage.locator('.owl-marker').count(),0);assert.equal(await mapPage.locator('.project-summary').count(),0);check('empty filters remove markers and stale selection');
 await mapPage.getByRole('button',{name:'ล้างตัวกรองทั้งหมด'}).click();
 await mapPage.setViewportSize({width:390,height:844});await mapPage.locator('.owl-marker').first().click();assert.equal(await mapPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);check('mobile 390px: no page overflow and tappable owl');
 await mapPage.screenshot({path:'/tmp/pe-map-mobile.png',fullPage:true});
 await mapPage.setViewportSize({width:1440,height:1000});await mapPage.screenshot({path:'/tmp/pe-map-desktop.png',fullPage:true});
 const broken=await browser.newPage();await broken.route('https://maps.googleapis.com/**',r=>r.abort());await broken.route('**/api/photos/**',r=>r.fulfill({status:404,body:''}));await broken.goto(configured,{waitUntil:'networkidle'});await broken.locator('.project-options button').filter({hasText:'Life Asoke Hype'}).click();await broken.locator('.project-summary').scrollIntoViewIfNeeded();await broken.locator('.project-summary .no-image').waitFor();check('project cover broken/missing-image fallback');
 const failure=await browser.newPage();await failure.route('https://maps.googleapis.com/**',r=>r.abort());await failure.goto(configured,{waitUntil:'networkidle'});await failure.getByRole('status').filter({hasText:'โหลด Google Maps ไม่สำเร็จ'}).waitFor();check('SDK network failure state');
 const auth=await browser.newPage();await auth.route('https://maps.googleapis.com/**',r=>r.fulfill({contentType:'text/javascript',body:sdk+';setTimeout(()=>window.gm_authFailure?.(),50);'}));await auth.goto(configured,{waitUntil:'networkidle'});await auth.getByRole('status').filter({hasText:'โหลด Google Maps ไม่สำเร็จ'}).waitFor();check('Google authentication/billing failure state');
 assert.deepEqual(errors,[]);check('no browser JavaScript exceptions');
 report.passed.push('directory IDs, alias grouping, distinct phases, null pending coordinates');
}finally{await browser.close();await fs.writeFile('/tmp/pe-map-tests.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
