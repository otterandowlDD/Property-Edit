// Browser keys are deliberately public, but must be restricted in Google Cloud.
// Enable only after an operator has checked BOTH API and HTTP-referrer restrictions.
export type MapsConfig={key:string;mapId:string;hosts:string[]};
let loading:Promise<void>|undefined;
export function loadGoogleMaps(key:string):Promise<void>{
 if(window.google?.maps?.importLibrary)return Promise.resolve();
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  const finish=()=>{clearTimeout(timer);delete window.peMapsReady;};
  const timer=setTimeout(()=>{finish();reject(Error("timeout"));},20000);
  window.peMapsReady=()=>{finish();resolve();};
  script.src="https://maps.googleapis.com/maps/api/js?"+new URLSearchParams({key,v:"weekly",loading:"async",callback:"peMapsReady",language:"th",region:"TH"});
  script.async=true;script.onerror=()=>{finish();reject(Error("network"));};document.head.appendChild(script);
 });
 return loading;
}
// Narrow SDK boundary; the app does not install/ship a second mapping implementation.
export interface MapInstance{fitBounds(b:unknown,padding?:number):void;panTo(p:{lat:number;lng:number}):void;setZoom(n:number):void;}
export interface MarkerInstance extends HTMLElement{map:MapInstance|null;zIndex:number;addListener(event:string,handler:()=>void):{remove():void};}
export interface MapsSDK{
 importLibrary(name:string):Promise<unknown>;
 Map:new(element:HTMLElement,options:Record<string,unknown>)=>MapInstance;
 LatLngBounds:new()=>{extend(p:{lat:number;lng:number}):void};
 marker:{AdvancedMarkerElement:new(options:Record<string,unknown>)=>MarkerInstance};
 event:{clearInstanceListeners(instance:unknown):void};
}
declare global{interface Window{google?:{maps:MapsSDK};peMapsReady?:()=>void;gm_authFailure?:()=>void;}}
