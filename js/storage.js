(function(){
  const KEY="nobodyArcade.phase2"; const VERSION=2;
  const names=["Neon Otter","Glitch Wizard","Tape Goblin","Questionable Employee","Pixel Raccoon"];
  const iso=()=>new Date().toISOString(), day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
  function fresh(){const now=iso(),today=day();return {schemaVersion:VERSION,passport:{nickname:names[Math.floor(Math.random()*names.length)],arcadeId:`NA-${crypto?.randomUUID?.().slice(0,8).toUpperCase()||Math.random().toString(36).slice(2,10).toUpperCase()}`,xp:0,firstVisit:now,lastVisit:now,visitDays:[today],launches:0,caseStudies:[],genres:[],games:{}},favorites:[],playLater:[],achievements:{},activity:[],challenges:{},settings:{sound:false,reducedMotion:false,autoplay:true,dataSaver:false},awards:{}}}
  function valid(v){return v&&v.schemaVersion===VERSION&&v.passport&&typeof v.passport.nickname==="string"&&Array.isArray(v.favorites)&&Array.isArray(v.playLater)&&v.achievements&&v.challenges}
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(valid(v))return v}catch{} const v=fresh();save(v);return v}
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{} window.dispatchEvent(new CustomEvent("arcade-state",{detail:v}));return v}
  function exportData(){const v=load();return {...v,exportDate:iso()}}
  window.ArcadeStorage={KEY,VERSION,load,save,fresh,valid,exportData,day,iso};
})();
