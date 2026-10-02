/* Compatibility boundary for the original, screen-specific domain controllers.
   UI trees are rendered by React. This adapter scopes DOM operations to a shadow root
   and cleans timers/listeners/observers on unmount. It is not a second UI library. */
import {createMotion,attachBorder,attachTabShape} from './legacyUiInternals';
  const memoryStorage = ()=>{
    const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),clear:()=>map.clear(),key:i=>[...map.keys()][i]||null,get length(){return map.size;}};
  };
  export function createScreenContext(host,root,body,definition){
    const realDoc=document, realWin=window;
    const own={},timers=new Set(),intervals=new Set(),rafs=new Set(),observers=new Set(),subscriptions=[];
    let resizeObserver,upgradeObserver;
    const ctx={host,root,body,definition,active:true,disposed:false,width:definition.width,height:definition.height,api:own,errors:[],borders:new Map(),motion:createMotion(root)};
    const track=(target,type,fn,options)=>{target.addEventListener(type,fn,options);subscriptions.push(()=>target.removeEventListener(type,fn,options));};
    const listen=(type,fn,opts)=>track(root,type,fn,opts);
    const scopedDoc=new Proxy(realDoc,{
      get(target,key){
        if(key==='querySelector')return s=>s==='body'||s==='html'||s===':root'?body:root.querySelector(s);
        if(key==='querySelectorAll')return s=>root.querySelectorAll(s);
        if(key==='getElementById')return id=>root.getElementById(String(id));
        if(key==='getElementsByClassName')return cls=>root.querySelectorAll('.'+CSS.escape(cls));
        if(key==='body'||key==='documentElement')return body;
        if(key==='head')return root;
        if(key==='hidden')return realDoc.hidden||!ctx.active;
        if(key==='visibilityState')return realDoc.hidden||!ctx.active?'hidden':'visible';
        if(key==='activeElement')return root.activeElement||realDoc.activeElement;
        if(key==='title')return ctx.title||definition.title;
        if(key==='addEventListener')return listen;
        if(key==='removeEventListener')return root.removeEventListener.bind(root);
        if(key==='dispatchEvent')return root.dispatchEvent.bind(root);
        if(key==='getAnimations')return()=>realDoc.getAnimations().filter(a=>a.effect?.target?.getRootNode()===root);
        const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;
      },set(target,key,value){if(key==='title'){ctx.title=value;return true;}return Reflect.set(target,key,value);}
    });
    ctx.document=scopedDoc;ctx.hidden=()=>!ctx.active||realDoc.hidden;
    ctx.setTimeout=(fn,ms,...args)=>{const id=realWin.setTimeout(()=>{timers.delete(id);if(!ctx.disposed)fn(...args);},ms);timers.add(id);return id;};
    ctx.clearTimeout=id=>{timers.delete(id);realWin.clearTimeout(id);};
    ctx.setInterval=(fn,ms,...args)=>{const id=realWin.setInterval(()=>{if(ctx.active&&!ctx.disposed)fn(...args);},ms);intervals.add(id);return id;};
    ctx.clearInterval=id=>{intervals.delete(id);realWin.clearInterval(id);};
    ctx.requestAnimationFrame=fn=>{const id=realWin.requestAnimationFrame(t=>{rafs.delete(id);if(!ctx.disposed&&ctx.active)fn(t);});rafs.add(id);return id;};
    ctx.cancelAnimationFrame=id=>{rafs.delete(id);realWin.cancelAnimationFrame(id);};
    ctx.ResizeObserver=class extends ResizeObserver{constructor(fn){super(entries=>{if(!ctx.disposed)fn(entries);});observers.add(this);}};
    ctx.MutationObserver=class extends MutationObserver{constructor(fn){super((entries,obs)=>{if(!ctx.disposed)fn(entries,obs);});observers.add(this);}};
    ctx.matchMedia=query=>{
      const m=realWin.matchMedia(query);
      return new Proxy(m,{get(t,k){if(k==='addEventListener')return(type,fn,opts)=>track(t,type,fn,opts);const value=Reflect.get(t,k,t);return typeof value==='function'?value.bind(t):value;}});
    };
    ctx.addEventListener=listen;ctx.removeEventListener=root.removeEventListener.bind(root);
    const store=memoryStorage();
    const scopedStorage=new Proxy(store,{get(t,k){try{const storage=realWin.localStorage;const v=storage[k];return typeof v==='function'?v.bind(storage):v;}catch{return typeof t[k]==='function'?t[k].bind(t):t[k];}}});
    ctx.localStorage=scopedStorage;
    ctx.window=new Proxy(realWin,{
      get(t,k){
        if(k in own)return own[k];if(k==='window'||k==='self')return ctx.window;
        if(k==='document')return scopedDoc;if(k==='innerWidth')return ctx.width;if(k==='innerHeight')return ctx.height;
        if(k in ctx&&['addEventListener','removeEventListener','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','setInterval','clearInterval','ResizeObserver','MutationObserver','matchMedia','localStorage'].includes(k))return ctx[k];
        if(k==='dispatchEvent')return root.dispatchEvent.bind(root);
        const v=Reflect.get(t,k,t);return typeof v==='function'&&!/^[A-Z]/.test(String(k))?v.bind(t):v;
      },set(t,k,v){own[k]=v;return true;}
    });
    const borderSelectors=definition.borderSelectors||[];
    const tabs=new Set();ctx.installTabShapes=()=>root.querySelectorAll('[data-tab-shape]').forEach(b=>{const item=attachTabShape(b);tabs.add(item);observers.add(item.observer);});
    ctx.installBorders=()=>{
      for(const [node,item]of ctx.borders)if(!node.isConnected){item.destroy();ctx.borders.delete(node);}
      for(const selector of borderSelectors){
        root.querySelectorAll(selector).forEach((element,index)=>{
          if(ctx.borders.has(element))return;
          const shell=element.matches(definition.shellSelector||':not(*)');
          const item=attachBorder(element,{shell,round:element.dataset.neon==='round',index:ctx.borders.size,scope:ctx.motion});ctx.borders.set(element,item);
        });
      }
    };
    ctx.getBorder=(element,index=0,shell=false)=>{
      const item=attachBorder(element,{index,shell,scope:ctx.motion});ctx.borders.set(element,item);return item;
    };
    ctx.resize=()=>{
      const bounds=host.getBoundingClientRect();ctx.width=host.dataset.zoom==='actual'?definition.width:Math.max(240,bounds.width);ctx.height=host.dataset.zoom==='actual'?definition.height:Math.max(200,bounds.height);
      root.dispatchEvent(new Event('resize'));ctx.installBorders();
    };
    ctx.setActive=active=>{
      if(ctx.active===active)return;ctx.active=active;
      ctx.motion.setActive(active);host.toggleAttribute('data-inactive',!active);
      root.dispatchEvent(new Event('visibilitychange'));
      if(active){ctx.resize();root.dispatchEvent(new Event('pageshow'));}
    };
    ctx.setMotion=enabled=>{
      for(const key of ['SettingsDemo','AnalysisView','PerformancesView','ProcessingQueueView','MelodyEditorView'])own[key]?.setMotion?.(enabled);
      own.KaraokeRoom?.setAnimations?.(enabled);
      ctx.motion.set(enabled);
      host.dataset.adMotion=enabled?'on':'off';
    };
    ctx.dispose=()=>{
      if(ctx.disposed)return;root.dispatchEvent(new Event('pagehide'));
      for(const value of Object.values(own)){try{value?.destroy?.();}catch{}}
      ctx.disposed=true;ctx.motion.dispose();
      for(const id of timers)realWin.clearTimeout(id);for(const id of intervals)realWin.clearInterval(id);for(const id of rafs)realWin.cancelAnimationFrame(id);
      for(const item of tabs)item.destroy();for(const observer of observers)observer.disconnect();for(const fn of subscriptions)fn();
      for(const item of ctx.borders.values())item.destroy();ctx.borders.clear();resizeObserver?.disconnect();upgradeObserver?.disconnect();
    };
    ctx.start=()=>{
      ctx.resize();
      resizeObserver=new ResizeObserver(ctx.resize);resizeObserver.observe(host);
      let queued=false;
      upgradeObserver=new MutationObserver(entries=>{
        if(entries.some(e=>e.type==='childList'&&[...e.addedNodes,...e.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('.ad-border,.ad-border *')))&&!queued){queued=true;queueMicrotask(()=>{queued=false;if(ctx.disposed)return;upgradeReference(root,definition);ctx.installBorders();});}
        const state=root.querySelector('[data-motion],#room');
        if(state){const enabled=state.dataset.motion!=='off'&&!state.classList.contains('is-still');if(ctx.motion.enabled!==enabled)ctx.motion.set(enabled);}
      });
      upgradeObserver.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-motion','class']});
      track(realDoc,'visibilitychange',()=>root.dispatchEvent(new Event('visibilitychange')));
      track(host,'pointerover',e=>{},false);
    };
    return ctx;
  }
  const upgradeReference=(root,definition)=>{
    for(const [selector,name,material] of definition.rules||[])root.querySelectorAll(selector).forEach(el=>{
      if(el.dataset.adComponent)return;
      el.dataset.adComponent=name;el.dataset.adReference='';if(material)el.dataset.adMaterial=material;
    });
  };
