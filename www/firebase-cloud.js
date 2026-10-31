import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, onSnapshot, serverTimestamp, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.yavkaCloudState = { ready:true, user:null, submissions:[], session:null, error:"", loading:false };
let stopWatch = null;
const emit = () => window.dispatchEvent(new CustomEvent("yavka-cloud-change"));
setPersistence(auth, browserLocalPersistence).catch(e=>{window.yavkaCloudState.error=e.message;emit();});
onAuthStateChanged(auth, user => {
  window.yavkaCloudState.user = user;
  if (!user || user.isAnonymous) {
    if (stopWatch) { stopWatch(); stopWatch=null; }
    window.yavkaCloudState.submissions=[];
    window.yavkaCloudState.session=null;
  }
  emit();
});
function localDate(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function daySchedule(date){
  const [y,m,d]=date.split("-").map(Number);
  const [ay,am,ad]=[2026,9,1];
  const anchor=Date.UTC(ay,am-1,ad), target=Date.UTC(y,m-1,d);
  const anchorMon=anchor-((new Date(anchor).getUTCDay()+6)%7)*86400000;
  const targetMon=target-((new Date(target).getUTCDay()+6)%7)*86400000;
  const week=((Math.floor((targetMon-anchorMon)/604800000)%2)+2)%2;
  const dow=new Date(y,m-1,d).getDay();
  const sch=[
    {1:["Физкультура","!Анатомия|2С","История России","Философия"],2:["Основы искусственного интеллекта","Основы искусственного интеллекта","Нормальная физиология","Нормальная физиология"],3:["","!Молекулярная биология|4","Латинский язык",""],4:["!Уход за больными|4","!Биология|5","Анатомия","Анатомия"],5:["!История России|4","!Основы Российской государственности|4","Биология","Биология"],6:["Молекулярная биология","Молекулярная биология","Основы Российской государственности",""]},
    {1:["Физкультура","История России","Основы Российской государственности",""],2:["","Философия","Латинский язык",""],3:["Молекулярная биология","Молекулярная биология","!Молекулярная биология|5","!Основы Российской государственности|4"],4:["Основы Российской государственности","Философия","Анатомия","Анатомия"],5:["!Нормальная физиология|6","!Основы искусственного интеллекта|4","Уход за больными","Уход за больными"],6:["","!Философия|4","",""]}
  ];
  const times=["08:30–10:05","10:30–12:05","13:00–14:35","15:00–16:35"];
  return (sch[week][dow]||[]).map((raw,k)=>{
    if(!raw)return null;
    const lecture=raw.startsWith("!");const [subject,room=""]=raw.replace(/^!/,"").split("|");
    return {slot:k,subject,room,type:(lecture && subject!=="Физкультура")?"lec":"sem",time:times[k]};
  }).filter(Boolean);
}
function assertAdmin(){if(!auth.currentUser || auth.currentUser.isAnonymous)throw new Error("Сначала войдите как староста.");}
window.yavkaCloud = {
  login: async (email,password)=>{window.yavkaCloudState.loading=true;emit();try{await signInWithEmailAndPassword(auth,email,password);window.yavkaCloudState.error="";}catch(e){window.yavkaCloudState.error=e.message;throw e;}finally{window.yavkaCloudState.loading=false;emit();}},
  logout: async ()=>{if(stopWatch){stopWatch();stopWatch=null;}await signOut(auth);},
  publish: async (group,names,date=localDate())=>{
    assertAdmin(); if(!names.length || names.some(n=>/^Студент\s+\d+$/i.test(n)))throw new Error("Сначала внесите реальные фамилии студентов во вкладке «Группа».");
    const lessons=daySchedule(date); if(!lessons.length)throw new Error("На сегодня в расписании нет пар.");
    const groupId=String(group||"Группа").trim();
    await setDoc(doc(db,"publicGroups",groupId),{groupId,names,updatedAt:serverTimestamp()});
    const now=new Date();const expires=new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999);
    const sessionId=groupId+"_"+date;
    await setDoc(doc(db,"sessions",sessionId),{groupId,date,open:true,expiresAt:expires,lessons,openedAt:serverTimestamp(),openedBy:auth.currentUser.uid},{merge:true});
    this.watch(groupId,date);return {url:"https://wdyavka.web.app/?group="+encodeURIComponent(groupId),lessons};
  },
  watch:(group,date=localDate())=>{
    assertAdmin();if(stopWatch){stopWatch();stopWatch=null;}
    const sessionId=String(group)+"_"+date;
    getDoc(doc(db,"sessions",sessionId)).then(s=>{window.yavkaCloudState.session=s.exists()?s.data():null;emit();}).catch(e=>{window.yavkaCloudState.error=e.message;emit();});
    stopWatch=onSnapshot(query(collection(db,"sessions",sessionId,"submissions"),orderBy("createdAt","asc")),snap=>{
      window.yavkaCloudState.submissions=snap.docs.map(d=>({id:d.id,...d.data()}));emit();
    },e=>{window.yavkaCloudState.error=e.message;emit();});
  },
  close: async (group,date=localDate())=>{assertAdmin();await setDoc(doc(db,"sessions",String(group)+"_"+date),{open:false},{merge:true});},
  import: async (group,date=localDate())=>{
    assertAdmin();const snap=await getDoc(doc(db,"sessions",String(group)+"_"+date));return snap.exists()?snap.data():null;
  }
};
